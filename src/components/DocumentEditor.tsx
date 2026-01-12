import { useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, FontSize, FontFamily } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { 
  FileText, 
  Save, 
  Download, 
  Eye, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Undo, 
  Redo,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Palette,
  Highlighter
} from 'lucide-react';
// @ts-ignore - html2pdf.js doesn't have perfect TypeScript support
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface DocumentEditorProps {
  assignmentTitle: string;
  instructions: string;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
}

export default function DocumentEditor({ assignmentTitle, instructions, onSave, onContentChange }: DocumentEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [editorState, setEditorState] = useState(0); // Force re-render on selection change
  const [showLinkConfirm, setShowLinkConfirm] = useState(false);
  const [confirmLinkUrl, setConfirmLinkUrl] = useState('');
  const [confirmLinkPosition, setConfirmLinkPosition] = useState({ x: 0, y: 0 });
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showFontFamilyMenu, setShowFontFamilyMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Link.extend({
        inclusive: false,
      }).configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your essay here...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onContentChange) {
        // Also send plain text version for AI context
        onContentChange(editor.getText());
      }
      // Force re-render to update color indicators
      setEditorState(prev => prev + 1);
    },
    onSelectionUpdate: () => {
      // Update state when selection changes to refresh color indicators
      setEditorState(prev => prev + 1);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
        style: 'font-size: 11px; font-family: Arial;',
      },
      handleClick: (view, pos, event) => {
        const { state } = view;
        const { doc } = state;
        const $pos = doc.resolve(pos);
        
        // Check if we clicked on a link
        const linkMark = $pos.marks().find(mark => mark.type.name === 'link');
        if (linkMark) {
          event.preventDefault();
          const href = linkMark.attrs.href;
          
          // Get click position for positioning the confirmation box
          const clickEvent = event as MouseEvent;
          const editorElement = editorRef.current?.querySelector('.ProseMirror');
          if (editorElement) {
            const rect = editorElement.getBoundingClientRect();
            const x = clickEvent.clientX - rect.left;
            const y = clickEvent.clientY - rect.top + 20; // Position below the click
            
            setConfirmLinkUrl(href);
            setConfirmLinkPosition({ x, y });
            setShowLinkConfirm(true);
          }
          return true;
        }
        return false;
      },
    },
  });

  const getWordCount = useCallback(() => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [editor]);

  const getCharacterCount = useCallback(() => {
    if (!editor) return 0;
    return editor.getText().length;
  }, [editor]);

  // Get current text color from editor (called during render)
  // Defaults to black if no color is set
  const getCurrentTextColor = () => {
    if (!editor) return '#000000'; // Default black
    const attrs = editor.getAttributes('textStyle');
    return attrs.color || '#000000'; // Default to black if no color set
  };

  // Get current highlight color from editor (called during render)
  const getCurrentHighlightColor = () => {
    if (!editor) return null;
    if (!editor.isActive('highlight')) return null;
    const attrs = editor.getAttributes('highlight');
    return attrs.color || null;
  };

  // Get current font size from editor (defaults to 11)
  const getCurrentFontSize = () => {
    if (!editor) return '11';
    const attrs = editor.getAttributes('textStyle');
    const fontSize = attrs.fontSize;
    if (!fontSize) return '11';
    // Remove 'px' suffix for display
    return fontSize.replace('px', '');
  };

  // Get current font family from editor
  const getCurrentFontFamily = () => {
    if (!editor) return 'Arial';
    const attrs = editor.getAttributes('textStyle');
    return attrs.fontFamily || 'Arial';
  };

  const handleSetFontSize = (size: string) => {
    if (!editor) return;
    editor.chain().focus().setFontSize(`${size}px`).run();
    setShowFontSizeMenu(false);
  };

  const handleSetFontFamily = (font: string) => {
    if (!editor) return;
    editor.chain().focus().setFontFamily(font).run();
    setShowFontFamilyMenu(false);
  };

  const handleSave = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!editor) return;
    
    const html = editor.getHTML();
    const text = editor.getText();
    
    if (onSave) {
      onSave(text); // Keep backward compatibility with plain text
    }
    
    if (format === 'pdf') {
      try {
        // Get the editor content element
        const element = editorRef.current?.querySelector('.ProseMirror');
        if (!element) {
          throw new Error('Editor element not found');
        }
        
        // Clone the element to avoid modifying the original and ensure proper styling
        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.style.padding = '20px';
        clonedElement.style.fontFamily = 'Arial, sans-serif';
        clonedElement.style.fontSize = '11px';
        clonedElement.style.width = '8.5in'; // Standard letter width
        clonedElement.style.minHeight = '11in'; // Standard letter height
        clonedElement.style.backgroundColor = '#ffffff';
        document.body.appendChild(clonedElement);
        
        const opt = {
          margin: 1,
          filename: `${assignmentTitle.replace(/\s+/g, '_')}_essay.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        await html2pdf().set(opt).from(clonedElement).save();
        document.body.removeChild(clonedElement);
      } catch (error) {
        console.error('Error generating PDF:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`Error generating PDF: ${errorMessage}. Please try again.`);
      }
    } else if (format === 'docx') {
      try {
        // Convert HTML to DOCX using the docx library
        // This is a simplified conversion - for complex HTML, you'd need a more sophisticated parser
        const paragraphs = editor.getText().split('\n').filter(p => p.trim()).map(
          text => new Paragraph({
            children: [new TextRun(text)]
          })
        );
        
        if (paragraphs.length === 0) {
          paragraphs.push(new Paragraph({
            children: [new TextRun('')]
          }));
        }

        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs,
          }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${assignmentTitle.replace(/\s+/g, '_')}_essay.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating DOCX:', error);
        // Fallback to HTML export
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlLink = document.createElement('a');
        htmlLink.href = htmlUrl;
        htmlLink.download = `${assignmentTitle.replace(/\s+/g, '_')}_essay.html`;
        document.body.appendChild(htmlLink);
        htmlLink.click();
        document.body.removeChild(htmlLink);
        URL.revokeObjectURL(htmlUrl);
        alert('DOCX export had issues. Exported as HTML instead (can be opened in Word).');
      }
    }
  };

  const handleSetColor = (color: string) => {
    if (!editor) return;
    // Apply color using the Color extension
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const handleSetHighlight = (color: string | null = '#fffb00') => {
    if (!editor) return;
    if (color === null) {
      // Remove highlight
      editor.chain().focus().unsetHighlight().run();
    } else {
      // Apply highlight with color
      editor.chain().focus().toggleHighlight({ color }).run();
    }
    setShowHighlightPicker(false);
  };

  const handleToggleHighlight = () => {
    if (!editor) return;
    // Always show the color picker when clicked
    setShowHighlightPicker(!showHighlightPicker);
    setShowColorPicker(false);
  };

  const handleAddLink = () => {
    if (!editor || !linkUrl) return;
    
    const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
      ? linkUrl 
      : `https://${linkUrl}`;
    
    // Check if text is selected
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;
    
    if (hasSelection) {
      // Text is selected - apply link to selected text
      const { from, to } = editor.state.selection;
      editor.chain().focus().setLink({ href: url }).run();
      // Deselect the text by moving cursor to the end of the link
      editor.chain().setTextSelection(to).run();
    } else {
      // No text selected - insert new text as link
      const textToInsert = linkText.trim() || url;
      // Get position before insertion
      const insertPos = editor.state.selection.from;
      // Insert link and immediately move cursor outside of it
      editor.chain()
        .focus()
        .insertContent(`<a href="${url}">${textToInsert}</a>`)
        .setTextSelection(insertPos + textToInsert.length)
        .run();
    }
    
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  if (!editor) {
    return null;
  }

  const colorOptions = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
    '#FF0000', '#FF6600', '#FFCC00', '#33CC00', '#0066FF',
    '#6600CC', '#FF00CC', '#FFFFFF'
  ];

  const highlightColors = [
    { name: 'None', color: null },
    { name: 'Yellow', color: '#fffb00' },
    { name: 'Green', color: '#00ff00' },
    { name: 'Blue', color: '#00ffff' },
    { name: 'Pink', color: '#ff00ff' },
    { name: 'Orange', color: '#ff9900' },
  ];

  const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];
  const fontFamilies = [
    'Arial',
    'Calibri',
    'Comic Sans MS',
    'Courier New',
    'Georgia',
    'Helvetica',
    'Impact',
    'Lucida Console',
    'Palatino',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana'
  ];

  const MenuBar = () => {
    if (isPreview) return null;

    return (
      <div className="border-b border-gray-200 p-2 flex flex-wrap items-center gap-2 bg-gray-50">
        {/* Font Family and Font Size */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 relative">
          <button
            onClick={() => {
              setShowFontFamilyMenu(!showFontFamilyMenu);
              setShowFontSizeMenu(false);
            }}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 text-sm ${showFontFamilyMenu ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Font Family"
            style={{ fontFamily: getCurrentFontFamily(), minWidth: '120px' }}
          >
            {getCurrentFontFamily()}
          </button>
          {showFontFamilyMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-50 max-h-60 overflow-y-auto" style={{ minWidth: '150px' }}>
              {fontFamilies.map(font => (
                <button
                  key={font}
                  onClick={() => handleSetFontFamily(font)}
                  className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 relative">
          <button
            onClick={() => {
              setShowFontSizeMenu(!showFontSizeMenu);
              setShowFontFamilyMenu(false);
            }}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 text-sm ${showFontSizeMenu ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Font Size"
            style={{ minWidth: '60px' }}
          >
            {getCurrentFontSize()}
          </button>
          {showFontSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-50 max-h-60 overflow-y-auto" style={{ minWidth: '80px' }}>
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => handleSetFontSize(size)}
                  className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className={`p-2 rounded hover:bg-gray-200 relative ${showColorPicker ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Text Color"
            style={{
              borderBottom: `3px solid ${getCurrentTextColor()}`
            }}
          >
            <Palette className="h-4 w-4" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 z-50" style={{ minWidth: '200px' }}>
              <div className="mb-2 text-xs font-semibold text-gray-700">Text Color</div>
              <div className="grid grid-cols-7 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => handleSetColor(color)}
                    className="w-7 h-7 rounded border-2 border-gray-300 hover:scale-110 hover:border-blue-500 transition-all"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 relative">
          <button
            onClick={handleToggleHighlight}
            className={`p-2 rounded hover:bg-gray-200 relative ${editor.isActive('highlight') ? 'bg-blue-100 text-blue-600' : showHighlightPicker ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title={editor.isActive('highlight') ? 'Remove Highlight' : 'Highlight Color'}
            style={{
              borderBottom: getCurrentHighlightColor() ? `3px solid ${getCurrentHighlightColor()}` : 'none'
            }}
          >
            <Highlighter className="h-4 w-4" />
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 z-50" style={{ minWidth: '180px' }}>
              <div className="mb-2 text-xs font-semibold text-gray-700">Highlight Color</div>
              <div className="grid grid-cols-6 gap-2">
                {highlightColors.map(({ name, color }, index) => (
                  <button
                    key={index}
                    onClick={() => handleSetHighlight(color)}
                    className={`w-7 h-7 rounded border-2 border-gray-300 hover:scale-110 hover:border-blue-500 transition-all flex items-center justify-center ${color === null ? 'bg-white' : ''}`}
                    style={color ? { backgroundColor: color } : {}}
                    title={name}
                  >
                    {color === null && (
                      <span className="text-xs text-gray-500 font-bold">×</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 relative">
          {editor.isActive('link') ? (
            <button
              onClick={handleRemoveLink}
              className="p-2 rounded hover:bg-gray-200 text-red-600"
              title="Remove Link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowLinkDialog(!showLinkDialog)}
                className={`p-2 rounded hover:bg-gray-200 ${showLinkDialog ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              {showLinkDialog && (() => {
                const { from, to } = editor.state.selection;
                const hasSelection = from !== to;
                const selectedText = hasSelection ? editor.state.doc.textBetween(from, to) : '';
                
                return (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 z-50" style={{ width: '320px', maxWidth: 'calc(100vw - 20px)' }}>
                    {hasSelection ? (
                      <>
                        <div className="mb-2 text-xs text-gray-600">
                          Link text: <span className="font-semibold">"{selectedText}"</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Enter URL..."
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddLink();
                            } else if (e.key === 'Escape') {
                              setShowLinkDialog(false);
                              setLinkUrl('');
                              setLinkText('');
                            }
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                          autoFocus
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Enter link text..."
                          value={linkText}
                          onChange={(e) => setLinkText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab' && !e.shiftKey) {
                              e.preventDefault();
                              // Move focus to URL field
                              const urlInput = document.querySelector('.link-url-input') as HTMLInputElement;
                              urlInput?.focus();
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddLink();
                            } else if (e.key === 'Escape') {
                              setShowLinkDialog(false);
                              setLinkUrl('');
                              setLinkText('');
                            }
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                          autoFocus
                        />
                        <input
                          type="text"
                          placeholder="Enter URL..."
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddLink();
                            } else if (e.key === 'Escape') {
                              setShowLinkDialog(false);
                              setLinkUrl('');
                              setLinkText('');
                            }
                          }}
                          className="link-url-input w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                        />
                      </>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddLink}
                        className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Add Link
                      </button>
                      <button
                        onClick={() => {
                          setShowLinkDialog(false);
                          setLinkUrl('');
                          setLinkText('');
                        }}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">{assignmentTitle}</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePreview}
              className={`p-2 rounded-md ${isPreview ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Toggle Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            <div className="relative group">
              <button
                onClick={() => handleSave('docx')}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                title="Export as DOCX"
              >
                <Download className="h-4 w-4 mr-1" />
                Export DOCX
              </button>
            </div>
            <button
              onClick={() => handleSave('pdf')}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              title="Export as PDF"
            >
              <Save className="h-4 w-4 mr-1" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Instructions Panel */}
        <div className="w-1/3 border-r border-gray-200 p-4 bg-gray-50 overflow-y-auto">
          <h3 className="font-medium text-gray-900 mb-3">Assignment Instructions</h3>
          <div className="prose prose-sm max-w-none">
            <div 
              className="text-gray-700 text-sm"
              dangerouslySetInnerHTML={{ 
                __html: instructions || '<p>No instructions provided.</p>' 
              }}
            />
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col overflow-hidden" ref={editorRef}>
          {isPreview ? (
            <div className="flex-1 p-4 overflow-y-auto bg-white">
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                <div 
                  className="text-gray-900"
                  dangerouslySetInnerHTML={{ 
                    __html: editor.getHTML() || '<p>Start writing your essay...</p>' 
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <MenuBar />
              <div 
                className="flex-1 overflow-y-auto bg-white relative" 
                onClick={(e) => {
                  // Don't close if clicking inside the confirmation box or font menus
                  if ((e.target as HTMLElement).closest('.link-confirm-box') ||
                      (e.target as HTMLElement).closest('[class*="absolute"]')) {
                    return;
                  }
                  
                  setShowColorPicker(false);
                  setShowHighlightPicker(false);
                  setShowLinkDialog(false);
                  setShowFontSizeMenu(false);
                  setShowFontFamilyMenu(false);
                  
                  // Check if clicking on a link
                  const target = e.target as HTMLElement;
                  const linkElement = target.closest('a');
                  if (linkElement) {
                    e.preventDefault();
                    e.stopPropagation();
                    const href = linkElement.getAttribute('href');
                    if (href) {
                      const rect = linkElement.getBoundingClientRect();
                      const container = e.currentTarget as HTMLElement;
                      const containerRect = container.getBoundingClientRect();
                      const containerScrollTop = container.scrollTop;
                      
                      // Calculate position relative to container
                      let x = rect.left - containerRect.left + (rect.width / 2);
                      let y = rect.bottom - containerRect.top + 10 + containerScrollTop;
                      
                      // Box dimensions (approximate)
                      const boxWidth = 250;
                      const boxHeight = 120;
                      
                      // Keep box within horizontal boundaries
                      const minX = boxWidth / 2;
                      const maxX = containerRect.width - (boxWidth / 2);
                      x = Math.max(minX, Math.min(maxX, x));
                      
                      // Keep box within vertical boundaries
                      const maxY = containerRect.height + containerScrollTop - boxHeight - 10;
                      if (y > maxY) {
                        // Position above the link instead
                        y = rect.top - containerRect.top + containerScrollTop - boxHeight - 10;
                        // Make sure it's not above the container
                        y = Math.max(containerScrollTop + 10, y);
                      }
                      
                      setConfirmLinkUrl(href);
                      setConfirmLinkPosition({ x, y });
                      setShowLinkConfirm(true);
                    }
                    return;
                  }
                  
                  setShowColorPicker(false);
                  setShowHighlightPicker(false);
                  setShowLinkDialog(false);
                  setShowLinkConfirm(false);
                }}
              >
                <EditorContent editor={editor} />
                {/* Link confirmation box */}
                {showLinkConfirm && (
                  <div 
                    className="link-confirm-box absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50"
                    style={{
                      left: `${confirmLinkPosition.x}px`,
                      top: `${confirmLinkPosition.y}px`,
                      minWidth: '250px',
                      transform: 'translateX(-50%)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-sm text-gray-700 mb-2">
                      Open this link?
                    </div>
                    <div className="text-xs text-blue-600 mb-3 break-all">
                      {confirmLinkUrl}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          window.open(confirmLinkUrl, '_blank', 'noopener,noreferrer');
                          setShowLinkConfirm(false);
                        }}
                        className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setShowLinkConfirm(false)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Word count: {getWordCount()}</span>
          <span>Character count: {getCharacterCount()}</span>
        </div>
      </div>
    </div>
  );
}
