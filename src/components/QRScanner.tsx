import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, Copy, CheckCircle, AlertCircle, X, CameraOff, QrCode, Download, Scan, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';
import { BrowserMultiFormatReader } from '@zxing/library';
import QRCode from 'qrcode';

interface ScannedResult {
  data: string;
  timestamp: Date;
  format: string;
}

const QRScanner = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScannedResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [qrText, setQrText] = useState('');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filePath, setFilePath] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const barcodeReader = useRef<BrowserMultiFormatReader | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const scanCode = async (file: File) => {
    setIsScanning(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      // Try QR code scanning first
      try {
        const qrResult = await QrScanner.scanImage(file, {
          returnDetailedScanResult: true,
        });
        
        setScanResult({
          data: qrResult.data,
          timestamp: new Date(),
          format: 'QR Code'
        });
        
        toast({
          title: "QR Code Detected!",
          description: "Successfully extracted data from the QR code.",
        });
        return;
      } catch (qrError) {
        console.log('QR scanning failed, trying barcode...');
      }
      
      // If QR fails, try barcode scanning
      try {
        if (!barcodeReader.current) {
          barcodeReader.current = new BrowserMultiFormatReader();
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        const barcodeResult = await barcodeReader.current.decodeFromImageElement(img);
        
        setScanResult({
          data: barcodeResult.getText(),
          timestamp: new Date(),
          format: barcodeResult.getBarcodeFormat().toString()
        });
        
        toast({
          title: "Barcode Detected!",
          description: "Successfully extracted data from the barcode.",
        });
        return;
      } catch (barcodeError) {
        console.log('Barcode scanning failed:', barcodeError);
      }
      
      throw new Error('No code detected');
    } catch (error) {
      console.error('Code scanning error:', error);
      toast({
        title: "No Code Found",
        description: "Could not detect a QR code or barcode in this image. Please try another image.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const loadFromFilePath = async () => {
    if (!filePath.trim()) {
      toast({
        title: "Path Required",
        description: "Please enter a file path.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a file input to handle the path
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Could not load file from path');
      }
      
      const blob = await response.blob();
      const file = new File([blob], 'image', { type: blob.type });
      
      await scanCode(file);
    } catch (error) {
      console.error('File path loading error:', error);
      toast({
        title: "Path Load Failed",
        description: "Could not load image from the specified path. Please check the path and try again.",
        variant: "destructive",
      });
    }
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      setCameraError(null);
      setIsCameraActive(true);
      
      const hasCamera = await QrScanner.hasCamera();
      console.log('Has camera:', hasCamera);
      
      if (!hasCamera) {
        throw new Error('No camera found on this device');
      }
      
      if (videoRef.current) {
        console.log('Creating scanner instance...');
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('Code detected:', result);
            
            setScanResult({
              data: result.data,
              timestamp: new Date(),
              format: 'QR Code'
            });
            
            toast({
              title: "QR Code Detected!",
              description: "Successfully scanned QR code from camera.",
            });
            stopCamera();
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
            returnDetailedScanResult: true,
          }
        );
        
        console.log('Starting scanner...');
        await qrScannerRef.current.start();
        console.log('Scanner started successfully');
      }
    } catch (error) {
      console.error('Camera error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not access camera. Please check permissions.';
      setCameraError(errorMessage);
      setIsCameraActive(false);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const generateQRCode = async () => {
    if (!qrText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text to generate QR code.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(qrText, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setGeneratedQR(qrDataUrl);
      toast({
        title: "QR Code Generated!",
        description: "Your QR code has been created successfully.",
      });
    } catch (error) {
      console.error('QR generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (generatedQR) {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = generatedQR;
      link.click();
    }
  };

  useEffect(() => {
    return () => {
      console.log('Cleanup: stopping camera');
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      scanCode(imageFile);
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
      scanCode(file);
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
    if (isCameraActive) {
      stopCamera();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <QrCode className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              QR Code Generator & Scanner
            </h1>
            <p className="text-gray-600 text-lg">
              Generate QR codes or scan existing QR codes & barcodes
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Link Manager
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <Button
              onClick={() => setActiveTab('scan')}
              variant={activeTab === 'scan' ? 'default' : 'ghost'}
              className={`gap-2 ${activeTab === 'scan' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
            >
              <Scan className="w-4 h-4" />
              Scanner
            </Button>
            <Button
              onClick={() => setActiveTab('generate')}
              variant={activeTab === 'generate' ? 'default' : 'ghost'}
              className={`gap-2 ${activeTab === 'generate' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
            >
              <QrCode className="w-4 h-4" />
              Generator
            </Button>
          </div>
        </div>

        {activeTab === 'scan' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Scanner Area */}
            <Card className="relative overflow-hidden lg:col-span-2">
              <CardContent className="p-0">
                {isCameraActive ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover rounded-t-lg"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-white rounded-lg w-48 h-48 opacity-70 shadow-lg"></div>
                    </div>
                    <div className="p-4 bg-gray-900 text-white text-center">
                      <p className="mb-3">Point camera at QR code or barcode</p>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-white text-gray-900 hover:bg-gray-100"
                      >
                        <CameraOff className="w-4 h-4" />
                        Stop Camera
                      </Button>
                    </div>
                  </div>
                ) : (
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
                          <div className="flex gap-2 justify-center">
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
                            or choose from the options below
                          </p>
                          
                          {/* File Path Input */}
                          <div className="mb-4 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={filePath}
                                onChange={(e) => setFilePath(e.target.value)}
                                placeholder="Paste file path here (e.g., /path/to/image.jpg)"
                                className="flex-1"
                              />
                              <Button
                                onClick={loadFromFilePath}
                                variant="outline"
                                className="gap-2"
                                disabled={isScanning}
                              >
                                <FileText className="w-4 h-4" />
                                Load
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                              Enter a local file path or URL to an image
                            </p>
                          </div>
                          
                          <div className="flex gap-3 justify-center">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              disabled={isScanning}
                            >
                              {isScanning ? 'Scanning...' : 'Choose File'}
                            </Button>
                            <Button
                              onClick={startCamera}
                              variant="outline"
                              className="gap-2"
                              disabled={isScanning}
                            >
                              <Camera className="w-4 h-4" />
                              Use Camera
                            </Button>
                          </div>
                          {cameraError && (
                            <p className="text-red-500 text-sm mt-2">{cameraError}</p>
                          )}
                        </>
                      )}
                    </div>
                    
                    {isScanning && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Scanning code...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
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
                        {scanResult.format} Data:
                      </label>
                      <div className="bg-white rounded border p-3 font-mono text-sm break-all">
                        {scanResult.data}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          Format: {scanResult.format}
                        </span>
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
                      No code data yet. Upload an image, paste a file path, or use camera to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* QR Generator Section */
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-2">
                  <QrCode className="w-6 h-6 text-blue-600" />
                  Generate QR Code
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="qr-text" className="text-lg">Enter text or URL:</Label>
                    <Input
                      id="qr-text"
                      value={qrText}
                      onChange={(e) => setQrText(e.target.value)}
                      placeholder="https://example.com or any text"
                      className="mt-2 text-lg p-4"
                    />
                  </div>
                  
                  <Button
                    onClick={generateQRCode}
                    disabled={isGenerating || !qrText.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-4"
                  >
                    {isGenerating ? 'Generating...' : 'Generate QR Code'}
                  </Button>
                  
                  {generatedQR && (
                    <div className="text-center space-y-4 mt-8">
                      <div className="bg-white p-6 rounded-lg shadow-md inline-block">
                        <img
                          src={generatedQR}
                          alt="Generated QR Code"
                          className="mx-auto rounded-lg"
                        />
                      </div>
                      <Button
                        onClick={downloadQRCode}
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download QR Code
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3">How to use:</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Upload className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">1. Upload Image</p>
                  <p>Drag & drop or select an image containing a QR code or barcode</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">2. File Path</p>
                  <p>Paste a local file path or URL to load an image directly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Camera className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">3. Use Camera</p>
                  <p>Click "Use Camera" to scan QR codes in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Copy className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">4. Copy Data</p>
                  <p>View the extracted data and copy it to your clipboard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <QrCode className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">5. Generate QR</p>
                  <p>Create your own QR codes from text or URLs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 py-6">
          <p className="text-gray-600 text-sm">
            Built with ❤️ by{' '}
            <a 
              href="https://ultrondevelopments.com.au" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Ultron Developments
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
