import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Écrivez votre contenu...", label = "Contenu" }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"rich" | "html">("rich");

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'check',
    'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const handleRichTextChange = (content: string) => {
    onChange(content);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label>{label} *</Label>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "rich" | "html")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rich">Éditeur visuel</TabsTrigger>
          <TabsTrigger value="html">Code HTML</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rich" className="mt-2">
          <div className="border border-input rounded-md overflow-hidden">
            <ReactQuill
              theme="snow"
              value={value}
              onChange={handleRichTextChange}
              placeholder={placeholder}
              modules={modules}
              formats={formats}
              style={{
                height: "300px",
                paddingBottom: "42px"
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="html" className="mt-2">
          <Textarea
            value={value}
            onChange={handleHtmlChange}
            placeholder="Écrivez votre HTML ici..."
            rows={15}
            className="font-mono text-sm"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}