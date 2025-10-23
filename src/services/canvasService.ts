import axios from 'axios';
import { CanvasUser, CanvasCourse, CanvasAssignment, PlannerItem, CanvasSubmission, CanvasFile } from '../types/canvas';
import { demoUser, demoCourses, getDemoAssignments } from '../data/demoData';

export class CanvasService {
  private accessToken: string;
  private domain: string;
  private baseURL: string;
  private isDemoMode: boolean;
  private debug: boolean;

  constructor(accessToken: string, domain: string) {
    this.accessToken = accessToken.trim();
    this.domain = domain.trim();
    this.isDemoMode = accessToken === 'demo_token_12345' && domain === 'demo.instructure.com';
    this.debug = (import.meta as any).env?.VITE_DEBUG === 'true';
    
    if (!this.isDemoMode) {
      const d = this.domain.toLowerCase();
      // Use dev proxy for Camino to bypass browser CORS during development
      this.baseURL = d === 'camino.instructure.com'
        ? '/canvas/api/v1'
        : `https://${this.domain}/api/v1`;
      if (this.debug) {
        console.info('[CanvasService] Base URL set to:', this.baseURL);
      }
    }
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      if (this.debug) {
        console.info('[CanvasService] GET', `${this.baseURL}${endpoint}`);
      }
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false,
      });
      return response.data as T;
    } catch (error: any) {
      const isAxios = !!error && !!error.isAxiosError;
      const status = isAxios ? error.response?.status : undefined;
      const data = isAxios ? error.response?.data : undefined;
      const isNetwork = isAxios && !error.response;
      const corsHint = isNetwork ? 'Network/CORS error: Browser requests to Canvas are likely blocked. Use a server proxy or demo mode.' : '';
      const details = {
        domain: this.domain,
        endpoint,
        status,
        message: isAxios ? error.message : String(error),
        data
      } as any;
      console.error('[CanvasService] Canvas API error:', details);
      const msg = isNetwork
        ? `Failed to reach Canvas at ${this.domain}. ${corsHint}`
        : `Canvas API error${status ? ` (${status})` : ''}: ${data?.errors?.[0]?.message || error.message || 'Unknown error'}`;
      throw new Error(msg);
    }
  }

  async getUser(): Promise<CanvasUser> {
    if (this.isDemoMode) {
      return demoUser;
    }
    return this.makeRequest<CanvasUser>('/users/self');
  }

  async getCourses(): Promise<CanvasCourse[]> {
    if (this.isDemoMode) {
      return demoCourses;
    }
    return this.makeRequest<CanvasCourse[]>('/courses?enrollment_state=active&include[]=term&per_page=100');
  }

  async getCourseAssignments(courseId: number): Promise<CanvasAssignment[]> {
    if (this.isDemoMode) {
      return getDemoAssignments().filter(assignment => assignment.course_id === courseId);
    }
    return this.makeRequest<CanvasAssignment[]>(`/courses/${courseId}/assignments?per_page=100`);
  }

  async getPlannerItems(startDate: string, endDate: string): Promise<PlannerItem[]> {
    if (this.isDemoMode) {
      const assignments = getDemoAssignments();
      return assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.name,
        context_name: demoCourses.find(c => c.id === assignment.course_id)?.name || 'Unknown Course',
        context_type: 'Course',
        plannable_type: 'assignment',
        plannable_date: assignment.due_at || new Date().toISOString(),
        plannable: {
          id: assignment.id,
          title: assignment.name,
          points_possible: assignment.points_possible,
          due_at: assignment.due_at,
        },
        course_id: assignment.course_id,
        html_url: assignment.html_url,
      }));
    }
    return this.makeRequest<PlannerItem[]>(`/planner/items?start_date=${startDate}&end_date=${endDate}&per_page=100`);
  }

  async getSubmissions(courseId: number): Promise<CanvasSubmission[]> {
    if (this.isDemoMode) {
      return [];
    }
    return this.makeRequest<CanvasSubmission[]>(`/courses/${courseId}/students/submissions?student_ids[]=self&per_page=100`);
  }

  async getAssignmentDetails(courseId: number, assignmentId: number): Promise<CanvasAssignment> {
    return this.makeRequest<CanvasAssignment>(`/courses/${courseId}/assignments/${assignmentId}`);
  }

  async getAllAssignments(): Promise<CanvasAssignment[]> {
    const courses = await this.getCourses();
    const allAssignments: CanvasAssignment[] = [];
    
    for (const course of courses) {
      try {
        const assignments = await this.getCourseAssignments(course.id);
        allAssignments.push(...assignments);
      } catch (error) {
        console.warn(`[CanvasService] Failed to fetch assignments for course ${course.id}:`, error);
      }
    }
    
    return allAssignments;
  }

  getUpcomingAssignments(assignments: CanvasAssignment[], days: number = 7): CanvasAssignment[] {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    return assignments
      .filter(assignment => {
        if (!assignment.due_at) return false;
        const dueDate = new Date(assignment.due_at);
        return dueDate >= now && dueDate <= future;
      })
      .sort((a, b) => {
        if (!a.due_at || !b.due_at) return 0;
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      });
  }

  // New: Fetch syllabus body (if available) and search for exam dates
  async getCourseSyllabus(courseId: number): Promise<string | null> {
    if (this.isDemoMode) {
      // Demo syllabus content with exam dates
      return 'Course Syllabus for Demo Course\nMidterm Exam: October 20, 2025\nFinal Exam: December 15, 2025';
    }
    try {
      const course = await this.makeRequest<CanvasCourse>(`/courses/${courseId}?include[]=syllabus_body`);
      const body = (course as any)?.syllabus_body as string | undefined;
      if (body && body.trim().length > 0) return body;
    } catch (err) {
      console.warn('[CanvasService] Syllabus body not available via course include, will attempt files lookup.', err);
    }
    // Fallback: list course files and attempt to fetch likely syllabus files
    try {
      const files = await this.makeRequest<CanvasFile[]>(`/courses/${courseId}/files?per_page=100`);
      const candidates = files.filter(f => /syllabus/i.test(f.display_name || f.filename || '') && /pdf|text|msword|officedocument|markdown/i.test(f.content_type));
      for (const file of candidates) {
        try {
          // Return file URL as text content fetch; front-end may need CORS proxy to download
          const resp = await axios.get(file.url, { responseType: 'arraybuffer' });
          const contentType = resp.headers['content-type'] || '';
          if (/text|markdown/.test(contentType)) {
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(resp.data as ArrayBuffer);
          }
          // For PDF or DOC, return binary for later parsing; here we just return null and rely on user to upload
          // In future, integrate server-side PDF/DOC parsing.
        } catch (err) {
          console.warn(`[CanvasService] Failed to download file ${file.display_name}`, err);
          continue;
        }
      }
    } catch (err) {
      console.warn('[CanvasService] Failed to list course files for syllabus lookup.', err);
    }
    return null;
  }

  // Extract midterm/final dates from syllabus text
  findExamDatesFromText(text: string): { midterm?: string; final?: string } {
    const lines = text.split(/\r?\n/);
    let midterm: string | undefined;
    let final: string | undefined;
    const dateRegex = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},\s+\d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/;
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (!midterm && /midterm/.test(lower)) {
        const m = line.match(dateRegex);
        if (m) midterm = m[0];
      }
      if (!final && /final/.test(lower)) {
        const m = line.match(dateRegex);
        if (m) final = m[0];
      }
      if (midterm && final) break;
    }
    return { midterm, final };
  }
}