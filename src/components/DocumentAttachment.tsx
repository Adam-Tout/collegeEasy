// import { useState } from 'react';
import { Paperclip, X, FileText, Loader2 } from 'lucide-react';

interface DocumentAttachmentProps {
  attachedDocName?: string;
  attachedDocText?: string;
  isParsingDoc: boolean;
  onAttachDocument: (file: File) => void;
  onRemoveDocument: () => void;
}

export default function DocumentAttachment({
  attachedDocName,
  // attachedDocText,
  isParsingDoc,
  onAttachDocument,
  onRemoveDocument
}: DocumentAttachmentProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAttachDocument(file);
    }
    e.target.value = '';
  };

  return (
    <>
      {/* Attach Button */}
      <label className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md flex items-center cursor-pointer transition-colors">
        <Paperclip className="h-4 w-4 mr-1" />
        Attach PDF/Text
        <input
          type="file"
          accept=".pdf,.txt,.md,text/plain,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {/* Attached Document Banner */}
      {attachedDocName && (
        <div className="flex items-center justify-between px-4 py-2 bg-primary-50 border-b border-primary-100 text-primary-900 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            <span>
              Attached: <strong>{attachedDocName}</strong> 
              {isParsingDoc && (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  (parsing...)
                </span>
              )}
            </span>
          </div>
          <button 
            onClick={onRemoveDocument} 
            className="text-primary-700 hover:text-primary-900 flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </button>
        </div>
      )}
    </>
  );
}
