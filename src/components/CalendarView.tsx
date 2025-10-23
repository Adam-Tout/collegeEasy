import { useState, useEffect } from 'react';
import { CanvasAssignment } from '../types/canvas';
import { format, addDays, isSameDay } from 'date-fns';
import { Calendar, Clock, BookOpen, ExternalLink } from 'lucide-react';

interface CalendarViewProps {
  assignments: CanvasAssignment[];
  onAssignmentClick: (assignment: CanvasAssignment) => void;
}

export default function CalendarView({ assignments, onAssignmentClick }: CalendarViewProps) {
  // const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(new Date(), i));
    }
    setWeekDates(dates);
  }, []);

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter(assignment => {
      if (!assignment.due_at) return false;
      const dueDate = new Date(assignment.due_at);
      return isSameDay(dueDate, date);
    });
  };

  const getDateColor = (date: Date) => {
    const today = new Date();
    if (isSameDay(date, today)) return 'bg-blue-100 border-blue-300';
    if (date < today) return 'bg-gray-100 border-gray-300';
    return 'bg-white border-gray-200';
  };

  const getAssignmentColor = (assignment: CanvasAssignment) => {
    if (!assignment.due_at) return 'bg-gray-100';
    const dueDate = new Date(assignment.due_at);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 1) return 'bg-red-100 border-red-200 text-red-800';
    if (daysUntilDue <= 3) return 'bg-yellow-100 border-yellow-200 text-yellow-800';
    return 'bg-green-100 border-green-200 text-green-800';
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Upcoming Assignments
          </h2>
          <span className="text-sm text-gray-500">
            {format(new Date(), 'MMMM d, yyyy')}
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="p-4 space-y-4">
          {weekDates.map((date, index) => {
            const dayAssignments = getAssignmentsForDate(date);
            const isToday = isSameDay(date, new Date());
            
            return (
              <div key={index} className={`rounded-lg border-2 p-3 ${getDateColor(date)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      isToday ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {format(date, 'EEEE, MMM d')}
                    </span>
                    {isToday && (
                      <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>

                {dayAssignments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No assignments due</p>
                ) : (
                  <div className="space-y-2">
                    {dayAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className={`p-3 rounded-md border cursor-pointer hover:shadow-sm transition-shadow ${getAssignmentColor(assignment)}`}
                        onClick={() => onAssignmentClick(assignment)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">
                              {assignment.name}
                            </h4>
                            <p className="text-xs opacity-75">
                              {assignment.points_possible} points
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 opacity-50" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming assignments found</p>
            <p className="text-sm text-gray-400 mt-1">
              Connect to Canvas to see your assignments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}