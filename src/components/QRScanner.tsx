
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Copy, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';

interface ScanResult {
  data: string;
  timestamp: Date;
}

const QRScanner = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const scanQRCode = async (file: File) => {
    setIsScanning(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      const result = await QrScanner.scanImage(file);
      
      setScanResult({
        data: result,
        timestamp: new Date()
      });
      
      toast({
        title: "QR Code Detected!",
        description: "Successfully extracted data from the QR code.",
      });
    } catch (error) {
      console.error('QR scanning error:', error);
      toast({
        title: "No QR Code Found",
        description: "Could not detect a QR code in this image. Please try another image.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      scanQRCode(imageFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      scanQRCode(file);
    }
  };

  const copyToClipboard = async () => {
    if (scanResult?.data) {
      try {
        await navigator.clipboard.writeText(scanResult.data);
        toast({
          title: "Copied!",
          description: "QR code data copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const clearResults = () => {
    setScanResult(null);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            QR Code Scanner
          </h1>
          <p className="text-gray-600 text-lg">
            Upload an image to scan and extract QR code data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-0">
              <div
                className={`relative border-2 border-dashed rounded-lg transition-all duration-300 ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isScanning ? 'pointer-events-none opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="p-8 text-center">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      <Button
                        onClick={clearResults}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <Upload className="w-16 h-16 mx-auto text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Drop your image here
                      </h3>
                      <p className="text-gray-500 mb-4">
                        or click to browse files
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={isScanning}
                      >
                        {isScanning ? 'Scanning...' : 'Choose File'}
                      </Button>
                    </>
                  )}
                </div>
                
                {isScanning && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Scanning QR code...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Results Area */}
          <Card className="h-fit">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Scan Results
              </h2>
              
              {scanResult ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600 block mb-2">
                      QR Code Data:
                    </label>
                    <div className="bg-white rounded border p-3 font-mono text-sm break-all">
                      {scanResult.data}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Scanned at {scanResult.timestamp.toLocaleTimeString()}
                    </span>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    No QR code data yet. Upload an image to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3">How to use:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Upload className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">1. Upload Image</p>
                  <p>Drag & drop or click to select an image containing a QR code</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Camera className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">2. Auto Scan</p>
                  <p>The app will automatically detect and scan the QR code</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Copy className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">3. Copy Data</p>
                  <p>View the extracted data and copy it to your clipboard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScanner;
