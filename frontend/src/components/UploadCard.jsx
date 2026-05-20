import { useState } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { uploadFile } from '../api/notesApi'
import toast from 'react-hot-toast'

export default function UploadCard({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async (file) => {
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    
    setUploading(true)
    try {
      const res = await uploadFile(formData)
      toast.success('File uploaded successfully!')
      onUploadSuccess(res.data)
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleUpload(e.dataTransfer.files[0])
  }

  return (
    <div 
      className={`glass p-8 border-2 border-dashed transition-all ${
        dragActive ? 'border-primary bg-primary/10' : 'border-white/10'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4">
        {uploading ? (
          <Loader2 className="animate-spin text-primary" size={48} />
        ) : (
          <Upload size={48} className="text-gray-400" />
        )}
        
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Drop your files here</p>
          <p className="text-sm text-gray-400">PDF, PPT, DOCX supported</p>
        </div>
        
        <label className="gradient-btn cursor-pointer">
          <span>Choose File</span>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.pptx,.docx,.txt"
            onChange={(e) => handleUpload(e.target.files[0])}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  )
}