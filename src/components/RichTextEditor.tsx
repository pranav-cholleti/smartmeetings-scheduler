
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Save } from 'lucide-react';

interface RichTextEditorProps {
  initialValue: string;
  readOnly?: boolean;
  onChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholderText?: string;
  className?: string;
  showControls?: boolean;
}

export function RichTextEditor({
  initialValue = '',
  readOnly = false,
  onChange,
  onSave,
  onCancel,
  placeholderText = 'Start typing...',
  className = '',
  showControls = true,
}: RichTextEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleChange = (value: string) => {
    setContent(value);
    if (onChange) onChange(value);
  };

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(content);
      } catch (error) {
        console.error('Error saving content:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const modules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'script',
    'indent',
    'color', 'background',
    'align',
    'clean'
  ];

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className={`rich-text-editor ${readOnly ? 'read-only' : ''}`}>
          <ReactQuill
            value={content}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholderText}
            readOnly={readOnly}
            theme="snow"
            className="min-h-[200px]"
          />
        </div>
      </CardContent>
      {showControls && !readOnly && onSave && (
        <CardFooter className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || content === initialValue}>
            {isSaving && <Spinner className="mr-2 h-4 w-4" />}
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </CardFooter>
      )}

      <style jsx>{`
        :global(.ql-container) {
          min-height: 200px;
          font-size: 16px;
          font-family: inherit;
        }
        
        :global(.read-only .ql-editor) {
          padding: 1.5rem;
          border-radius: 0.5rem;
        }
        
        :global(.read-only .ql-toolbar) {
          display: none;
        }
        
        :global(.ql-editor) {
          min-height: 200px;
        }
      `}</style>
    </Card>
  );
}
