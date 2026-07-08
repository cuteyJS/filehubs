import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Download, Trash2, File, Loader2, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 파일 목록 조회
  const { data: filesList = [], isLoading, refetch } = trpc.files.list.useQuery();

  // 파일 업로드
  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: () => {
      toast.success("파일이 업로드되었습니다.");
      setSelectedFile(null);
      setDescription("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "업로드 실패");
    },
  });

  // 파일 삭제
  const deleteMutation = trpc.files.delete.useMutation({
    onSuccess: () => {
      toast.success("파일이 삭제되었습니다.");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "삭제 실패");
    },
  });

  // 파일 다운로드
  const downloadMutation = trpc.files.download.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error) => {
      toast.error(error.message || "다운로드 실패");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("파일을 선택해주세요.");
      return;
    }

    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      startLogin();
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("description", description);

    try {
      const response = await fetch("/api/trpc/files.upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        toast.success("파일이 업로드되었습니다.");
        setSelectedFile(null);
        setDescription("");
        refetch();
      } else {
        toast.error("업로드 실패");
      }
    } catch (error) {
      toast.error("업로드 중 오류 발생");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const canDelete = (uploaderId: number) => {
    return user?.id === uploaderId || user?.role === "admin";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Share2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">파일 공유 플랫폼</h1>
          </div>
          <p className="text-gray-600">모두가 파일을 공유하고 다운로드할 수 있는 공개 저장소</p>
        </div>

        {/* 로그인 안내 */}
        {!isAuthenticated && (
          <Card className="p-4 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-blue-900">파일을 업로드하려면 로그인이 필요합니다.</p>
              <Button onClick={() => startLogin()} className="bg-blue-600 hover:bg-blue-700">
                로그인
              </Button>
            </div>
          </Card>
        )}

        {/* 파일 업로드 섹션 */}
        {isAuthenticated && (
          <Card className="p-6 mb-8 border-2 border-green-200 bg-white">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">파일 업로드</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  파일 선택
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition">
                  <Upload className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {selectedFile ? selectedFile.name : "파일을 선택하세요"}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 (선택사항)
                </label>
                <Input
                  type="text"
                  placeholder="파일에 대한 간단한 설명을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    업로드 중...
                  </>
                ) : (
                  "업로드"
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* 파일 목록 섹션 */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              파일 목록 ({filesList.length})
            </h2>
            {isAuthenticated && (
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    새로고침 중...
                  </>
                ) : (
                  "새로고침"
                )}
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
              <p className="text-gray-500 mt-2">파일 목록을 불러오는 중...</p>
            </div>
          ) : filesList.length === 0 ? (
            <div className="text-center py-8">
              <File className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">공유된 파일이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filesList.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {file.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{(file.fileSize / 1024).toFixed(2)} KB</span>
                        <span>•</span>
                        <span>다운로드: {file.downloads}</span>
                        {file.description && (
                          <>
                            <span>•</span>
                            <span className="truncate">{file.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => downloadMutation.mutate({ fileId: file.id })}
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:bg-blue-50"
                      disabled={downloadMutation.isPending}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {canDelete(file.uploaderId) && (
                      <Button
                        onClick={() => deleteMutation.mutate({ fileId: file.id })}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
