/**
 * Rich Text Input Component using TipTap
 * Requirement: 2.2 - Rich text editor for book description
 */
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useInput, InputProps } from 'react-admin';
import { Box, Paper, IconButton, Divider, Tooltip } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Undo,
  Redo,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useCallback, useEffect } from 'react';

interface RichTextInputProps extends InputProps {
  source: string;
  label?: string;
}

/**
 * Toolbar Button Component
 */
const ToolbarButton = ({
  onClick,
  isActive,
  icon,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ReactNode;
  title: string;
}) => (
  <Tooltip title={title}>
    <IconButton
      onClick={onClick}
      size="small"
      sx={{
        color: isActive ? 'primary.main' : 'text.secondary',
        backgroundColor: isActive ? 'action.selected' : 'transparent',
      }}
    >
      {icon}
    </IconButton>
  </Tooltip>
);

/**
 * Rich Text Input Component
 */
export const RichTextInput = ({ source, label }: RichTextInputProps) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useInput({ source });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Box sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
          {label}
        </Box>
      )}
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            p: 1,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'grey.50',
          }}
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={<FormatBold />}
            title="In đậm"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={<FormatItalic />}
            title="In nghiêng"
          />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={<FormatListBulleted />}
            title="Danh sách"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={<FormatListNumbered />}
            title="Danh sách số"
          />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={<FormatQuote />}
            title="Trích dẫn"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon={<Code />}
            title="Code"
          />
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            icon={<LinkIcon />}
            title="Thêm link"
          />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={<Undo />}
            title="Hoàn tác"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={<Redo />}
            title="Làm lại"
          />
        </Box>

        {/* Editor Content */}
        <Box
          sx={{
            '& .ProseMirror': {
              minHeight: 200,
              p: 2,
              outline: 'none',
              '& p': { margin: '0.5em 0' },
              '& ul, & ol': { paddingLeft: '1.5em' },
              '& blockquote': {
                borderLeft: '3px solid',
                borderColor: 'grey.300',
                pl: 2,
                ml: 0,
                fontStyle: 'italic',
              },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
      {error && (
        <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
          {error.message}
        </Box>
      )}
    </Box>
  );
};

export default RichTextInput;
