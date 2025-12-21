"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function KYCPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      setIsUploading(true);
      // Simulate API call
      setTimeout(() => {
        setIsUploading(false);
        toast.success('Document uploaded successfully! Your account will be reviewed shortly.');
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
          <CardDescription>To apply for gigs, you need to be a verified freelancer. Please upload a clear photo of your ID (Kebele/Residence).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {selectedFile ? (
                  <>
                    <FileCheck className="w-10 h-10 mb-3 text-green-500" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{selectedFile.name}</span> selected</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, or PDF (MAX. 5MB)</p>
                  </>
                )}
              </div>
              <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full cursor-pointer">
            {isUploading ? 'Uploading...' : 'Upload & Submit for Verification'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
