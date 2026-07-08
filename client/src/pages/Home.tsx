import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Download, Trash2, File, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FileItem {
  name: string;
  size: number;
  created_at: string;
  url?: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [bucketName, setBucketName] = useState("files");
  const [isConfigured, setIsConfigured] = useState(false);

  // 설정 저장
  const handleSaveConfig = () => {
    if (!supabaseUrl || !supabaseKey) {
      toast.error("Supabase URL과 API Key를 입력해주세요.");
      return;
    }
    localStorage.setItem("supabase_url", supabaseUrl);
    localStorage.setItem("supabase_key", supabaseKey);
    localStorage.setItem("bucket_name", bucketName);
    setIsConfigured(true);
    toast.success("설정이 저장되었습니다.");
    loadFiles();
  };

  // 설정 로드
  useEffect(() => {
    const savedUrl = localStorage.getItem("supabase_url");
    const savedKey = localStorage.getItem("supabase_key");
    const savedBucket = localStorage.getItem("bucket_name");
    
    if (savedUrl && savedKey) {
      setSupabaseUrl(savedUrl);
      setSupabaseKey(savedKey);
      setBucketName(savedBucket || "files");
      setIsConfigured(true);
    }
  }, []);

  // 파일 목록 조회
  const loadFiles = async () => {
    setLoading(true);
    try {
      const url = localStorage.getItem("supabase_url");
      const key = localStorage.getItem("supabase_key");
      const bucket = localStorage.getItem("bucket_name") || "files";

      if (!url || !key) {
        toast.error("Supabase 설정이 필요합니다.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${url}/storage/v1/b/${bucket}/o`,
        {
          headers: {
            "Authorization": `Bearer ${key}`,
            "apikey": key,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data || []);
      } else {
        toast.error("파일 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 파일 업로드
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = localStorage.getItem("supabase_url");
      const key = localStorage.getItem("supabase_key");
      const bucket = localStorage.getItem("bucket_name") || "files";

      if (!url || !key) {
        toast.error("Supabase 설정이 필요합니다.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("", file);

      const response = await fetch(
        `${url}/storage/v1/b/${bucket}/o/${file.name}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "apikey": key,
          },
          body: formData,
        }
      );

      if (response.ok) {
        toast.success("파일이 업로드되었습니다.");
        loadFiles();
      } else {
        toast.error("파일 업로드에 실패했습니다.");
      }
    } catch (error) {
      toast.error("업로드 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // 파일 삭제
  const handleDeleteFile = async (fileName: string) => {
    try {
      const url = localStorage.getItem("supabase_url");
      const key = localStorage.getItem("supabase_key");
      const bucket = localStorage.getItem("bucket_name") || "files";

      if (!url || !key) {
        toast.error("Supabase 설정이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${url}/storage/v1/b/${bucket}/o/${fileName}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${key}`,
            "apikey": key,
          },
        }
      );

      if (response.ok) {
        toast.success("파일이 삭제되었습니다.");
        loadFiles();
      } else {
        toast.error("파일 삭제에 실패했습니다.");
      }
    } catch (error) {
      toast.error("삭제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  // 파일 다운로드
  const handleDownloadFile = async (fileName: string) => {
    try {
      const url = localStorage.getItem("supabase_url");
      const key = localStorage.getItem("supabase_key");
      const bucket = localStorage.getItem("bucket_name") || "files";

      if (!url || !key) {
        toast.error("Supabase 설정이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${url}/storage/v1/b/${bucket}/o/${fileName}`,
        {
          headers: {
            "Authorization": `Bearer ${key}`,
            "apikey": key,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } else {
        toast.error("파일 다운로드에 실패했습니다.");
      }
    } catch (error) {
      toast.error("다운로드 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">파일 저장소</h1>
          <p className="text-gray-600">Supabase Storage를 사용하여 파일을 관리하세요</p>
        </div>

        {/* 설정 섹션 */}
        {!isConfigured ? (
          <Card className="p-6 mb-8 border-2 border-blue-200 bg-white">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Supabase 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supabase URL
                </label>
                <Input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (anon)
                </label>
                <Input
                  type="password"
                  placeholder="your-api-key"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bucket Name
                </label>
                <Input
                  type="text"
                  placeholder="files"
                  value={bucketName}
                  onChange={(e) => setBucketName(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleSaveConfig}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                설정 저장
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 파일 업로드 섹션 */}
            <Card className="p-6 border-2 border-green-200 bg-white">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">파일 업로드</h2>
              <div className="flex items-center gap-4">
                <label className="flex-1">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition">
                    <Upload className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {uploading ? "업로드 중..." : "파일 선택"}
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <Button
                  onClick={loadFiles}
                  disabled={loading}
                  variant="outline"
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      새로고침 중...
                    </>
                  ) : (
                    "새로고침"
                  )}
                </Button>
              </div>
            </Card>

            {/* 파일 목록 섹션 */}
            <Card className="p-6 bg-white">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                파일 목록 ({files.length})
              </h2>
              {files.length === 0 ? (
                <div className="text-center py-8">
                  <File className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">저장된 파일이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleDownloadFile(file.name)}
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteFile(file.name)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 설정 변경 */}
            <Button
              onClick={() => setIsConfigured(false)}
              variant="outline"
              className="w-full text-gray-600"
            >
              설정 변경
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
