import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export interface CodeEditorChange {
  newText: string;
  prevText: string;
  prevSelection: { from: number; to: number };
}

interface CodeEditorProps {
  value: string;
  spellCheckEnabled: boolean;
  themeMode: 'light' | 'dark';
  onChange: (change: CodeEditorChange) => void;
}

export interface CodeEditorHandle {
  getSelection: () => { from: number; to: number };
  setSelection: (from: number, to: number) => void;
  replaceAll: (text: string, selection?: { from: number; to: number }) => void;
  getText: () => string;
  focus: () => void;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  { value, spellCheckEnabled, themeMode, onChange },
  ref
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const spellcheckCompartmentRef = useRef(new Compartment());
  const suppressHistoryRef = useRef<boolean>(false);
  const cursorThemeCompartmentRef = useRef(new Compartment());

  // Initialize editor
  useEffect(() => {
    if (!hostRef.current) return;
    const isDark = themeMode === 'dark';

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          EditorView.lineWrapping,
          spellcheckCompartmentRef.current.of(
            EditorView.contentAttributes.of({ spellcheck: spellCheckEnabled ? 'true' : 'false' })
          ),
          cursorThemeCompartmentRef.current.of(
            EditorView.theme({
              '.cm-cursor, .cm-dropCursor': { 
                borderLeftColor: `${isDark ? '#fff' : '#000'} !important`,
                borderColor: `${isDark ? '#fff' : '#000'} !important`
              },
              '&.cm-focused .cm-cursor': {
                borderLeftColor: `${isDark ? '#fff' : '#000'} !important`
              },
              '.cm-content': {
                caretColor: `${isDark ? '#fff' : '#000'} !important`
              }
            })
          ),
          EditorView.theme({
            '&': { height: '100%' },
            '&.cm-focused': { outline: 'none' },
            '.cm-content': {
              fontFamily: 'Consolas, Menlo, monospace',
              fontSize: '14px'
            }
          }),
          EditorView.updateListener.of((update) => {
            if (suppressHistoryRef.current) return;
            if (update.docChanged) {
              const newTextValue = update.state.doc.toString();
              const prevTextValue = update.startState.doc.toString();
              const prevSel = update.startState.selection.main;
              try {
                onChange({
                  newText: newTextValue,
                  prevText: prevTextValue,
                  prevSelection: { from: prevSel.from, to: prevSel.to }
                });
              } catch {}
            }
          })
        ]
      }),
      parent: hostRef.current
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [themeMode]);

  // Reconfigure spellcheck attribute when toggled
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: spellcheckCompartmentRef.current.reconfigure(
        EditorView.contentAttributes.of({ spellcheck: spellCheckEnabled ? 'true' : 'false' })
      )
    });
  }, [spellCheckEnabled]);

  // Update cursor color when theme mode changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const isDark = themeMode === 'dark';
    view.dispatch({
      effects: cursorThemeCompartmentRef.current.reconfigure(
        EditorView.theme({
          '.cm-cursor, .cm-dropCursor': { 
            borderLeftColor: `${isDark ? '#fff' : '#000'} !important`,
            borderColor: `${isDark ? '#fff' : '#000'} !important`
          },
          '&.cm-focused .cm-cursor': {
            borderLeftColor: `${isDark ? '#fff' : '#000'} !important`
          },
          '.cm-content': {
            caretColor: `${isDark ? '#fff' : '#000'} !important`
          }
        })
      )
    });
  }, [themeMode]);

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      suppressHistoryRef.current = true;
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value }
      });
      suppressHistoryRef.current = false;
    }
  }, [value]);

  useImperativeHandle(ref, (): CodeEditorHandle => ({
    getSelection: () => {
      const sel = viewRef.current?.state.selection.main;
      return { from: sel?.from ?? 0, to: sel?.to ?? 0 };
    },
    setSelection: (from: number, to: number) => {
      if (!viewRef.current) return;
      const view = viewRef.current;
      view.dispatch({
        selection: { anchor: from, head: to },
        effects: EditorView.scrollIntoView(from)
      });
    },
    replaceAll: (text: string, selection?: { from: number; to: number }) => {
      if (!viewRef.current) return;
      const view = viewRef.current;
      suppressHistoryRef.current = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
        selection: selection ? { anchor: selection.from, head: selection.to } : undefined,
        effects: EditorView.scrollIntoView(selection ? selection.from : 0)
      });
      suppressHistoryRef.current = false;
    },
    getText: () => {
      return viewRef.current ? viewRef.current.state.doc.toString() : '';
    },
    focus: () => {
      viewRef.current?.focus();
    }
  }));

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />;
});


