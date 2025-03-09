import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppState } from '@/types';

interface HeaderMenuProps {
  onImport: (data: AppState) => void;
  onExport: () => void;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
  onImport,
  onExport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        onImport(jsonData);
      } catch (error) {
        alert('インポートに失敗しました。ファイルの形式が正しくありません。');
      }
    };
    reader.readAsText(file);

    // ファイル選択をリセット（同じファイルを再度選択可能にする）
    event.target.value = '';
  };

  return (
    <div className="fixed top-0 right-4 z-50 mt-2 flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleImportClick}
        title="データをインポート"
      >
        <Upload className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onExport}
        title="データをエクスポート"
      >
        <Download className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <ThemeToggle />
    </div>
  );
}; 