
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

interface MinutesEditorProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
}

export function MinutesEditor({ initialContent, onSave, onCancel }: MinutesEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
    } finally {
      setIsSaving(false);
    }
  };

  // Convert line breaks to HTML for preview
  const formatContentForPreview = (text: string) => {
    if (!text) return '';
    
    // Basic markdown-like formatting
    return text
      .replace(/\n\s*\n/g, '</p><p>') // Convert double line breaks to paragraphs
      .replace(/\n/g, '<br/>') // Convert single line breaks to <br/>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text **bold**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text *italic*
      .replace(/^#{3}\s+(.*)$/gm, '<h3>$1</h3>') // H3 headlines
      .replace(/^#{2}\s+(.*)$/gm, '<h2>$1</h2>') // H2 headlines
      .replace(/^#{1}\s+(.*)$/gm, '<h1>$1</h1>'); // H1 headlines
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Minutes</CardTitle>
        <CardDescription>Make changes to the meeting minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 space-x-2">
          <Button
            type="button"
            variant={isPreview ? "outline" : "default"}
            onClick={() => setIsPreview(false)}
            className="w-24"
          >
            Edit
          </Button>
          <Button
            type="button"
            variant={isPreview ? "default" : "outline"}
            onClick={() => setIsPreview(true)}
            className="w-24"
          >
            Preview
          </Button>
        </div>

        {isPreview ? (
          <div className="prose max-w-none border rounded-md p-4 min-h-[300px] bg-muted/20">
            <div dangerouslySetInnerHTML={{ __html: formatContentForPreview(content) }} />
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px]"
            placeholder="Enter meeting minutes here..."
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Save Minutes
        </Button>
      </CardFooter>
    </Card>
  );
}
