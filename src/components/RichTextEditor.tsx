import { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Heading1, Heading2, Image as ImageIcon } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            // Only update innerHTML if it doesn't match the current value to avoid cursor jump
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const execCommand = (command: string, cmdValue: string | undefined = undefined) => {
        document.execCommand(command, false, cmdValue);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            editorRef.current.focus();
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const addLink = () => {
        const url = prompt('Enter the link URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const addImage = () => {
        const url = prompt('Enter the image URL:');
        if (url) {
            execCommand('insertImage', url);
        }
    };

    return (
        <div className="w-full border border-input rounded-xl overflow-hidden bg-card focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
            <div className="bg-secondary/30 border-b border-border p-2 flex flex-wrap gap-1 items-center">
                <button type="button" onClick={() => execCommand('formatBlock', 'H1')} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Heading 1"><Heading1 className="h-4 w-4" /></button>
                <button type="button" onClick={() => execCommand('formatBlock', 'H2')} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Heading 2"><Heading2 className="h-4 w-4" /></button>
                <div className="w-px h-5 bg-border mx-1"></div>
                <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Bold"><Bold className="h-4 w-4" /></button>
                <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Italic"><Italic className="h-4 w-4" /></button>
                <button type="button" onClick={() => execCommand('underline')} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Underline"><Underline className="h-4 w-4" /></button>
                <div className="w-px h-5 bg-border mx-1"></div>
                <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Bullet List"><List className="h-4 w-4" /></button>
                <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Numbered List"><ListOrdered className="h-4 w-4" /></button>
                <div className="w-px h-5 bg-border mx-1"></div>
                <button type="button" onClick={addLink} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Add Link"><LinkIcon className="h-4 w-4" /></button>
                <button type="button" onClick={addImage} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Add Image"><ImageIcon className="h-4 w-4" /></button>
            </div>
            <div
                ref={editorRef}
                className="editor-content p-5 min-h-[350px] max-h-[600px] overflow-y-auto outline-none text-[15px] leading-relaxed"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                data-placeholder={placeholder}
            />
        </div>
    );
};
