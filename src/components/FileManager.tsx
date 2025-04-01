
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Upload, File, Download, Trash } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import api from "@/services/api";

interface FileManagerProps {
  meetingId: string;
  uploadEndpoint: string;
  downloadEndpoint: string;
  onUploadSuccess?: (data: any) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in bytes
  currentFileName?: string;
}

export function FileManager({
  meetingId,
  uploadEndpoint,
  downloadEndpoint,
  onUploadSuccess,
  acceptedFileTypes = ".pdf,.doc,.docx,.txt",
  maxFileSize = 10 * 1024 * 1024, // 10MB
  currentFileName,
}: FileManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await api.post(uploadEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("File uploaded successfully");
      setSelectedFile(null);
      setUploadProgress(0);
      if (onUploadSuccess) onUploadSuccess(data);
    },
    onError: () => {
      toast.error("Failed to upload file");
      setUploadProgress(0);
    },
  });
  
  const downloadMutation = useMutation({
    mutationFn: async () => {
      await api.download(downloadEndpoint);
    },
    onSuccess: () => {
      toast.success("File downloaded successfully");
    },
    onError: () => {
      toast.error("Failed to download file");
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > maxFileSize) {
        toast.error(`File is too large. Maximum file size is ${maxFileSize / (1024 * 1024)}MB`);
        return;
      }
      
      setSelectedFile(file);
    }
  };
  
  const handleUpload = async () => {
    if (selectedFile) {
      await uploadMutation.mutateAsync(selectedFile);
    }
  };
  
  const handleDownload = async () => {
    await downloadMutation.mutateAsync();
  };
  
  const handleClearSelection = () => {
    setSelectedFile(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">File Management</h3>
        {currentFileName && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
          >
            {downloadMutation.isPending ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Current File
          </Button>
        )}
      </div>
      
      {currentFileName && (
        <div className="flex items-center gap-2 text-sm p-2 bg-muted/40 rounded-md">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{currentFileName}</span>
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleFileChange}
            accept={acceptedFileTypes}
            className="flex-1"
            disabled={uploadMutation.isPending}
          />
          {selectedFile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearSelection}
              disabled={uploadMutation.isPending}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {selectedFile && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="truncate">{selectedFile.name}</span>
              <span>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            
            {uploadProgress > 0 && (
              <Progress value={uploadProgress} className="h-2" />
            )}
            
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Avoid importing the component separately
import { Input } from "@/components/ui/input";

export default FileManager;
