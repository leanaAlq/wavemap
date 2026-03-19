import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Comment } from 'shared';

export function useComments(socket: Socket | null, pinSessionId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket || !pinSessionId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    socket.emit('comments:load', { pinSessionId });

    // Safety valve — stop spinner after 5 s if server never responds
    timeoutRef.current = setTimeout(() => setLoading(false), 5000);

    function onList(data: { pinSessionId: string; comments: Comment[] }) {
      if (data.pinSessionId !== pinSessionId) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setComments(data.comments);
      setLoading(false);
    }

    function onNew(comment: Comment) {
      if (comment.pinSessionId === pinSessionId) {
        setComments(prev => [...prev, comment]);
      }
    }

    socket.on('comments:list', onList);
    socket.on('comment:new', onNew);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      socket.off('comments:list', onList);
      socket.off('comment:new', onNew);
    };
  }, [socket, pinSessionId]);

  const postComment = useCallback(
    (text: string) => {
      if (!socket || !pinSessionId || !text.trim()) return;
      socket.emit('comment:post', { pinSessionId, text: text.trim() });
    },
    [socket, pinSessionId],
  );

  return { comments, loading, postComment };
}
