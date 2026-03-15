import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Comment } from 'shared';

export function useComments(socket: Socket | null, pinSessionId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!socket || !pinSessionId) {
      setComments([]);
      return;
    }

    // Load existing comments for this pin
    socket.emit('comments:load', { pinSessionId });

    function onList(data: { pinSessionId: string; comments: Comment[] }) {
      if (data.pinSessionId === pinSessionId) setComments(data.comments);
    }

    function onNew(comment: Comment) {
      if (comment.pinSessionId === pinSessionId) {
        setComments(prev => [...prev, comment]);
      }
    }

    socket.on('comments:list', onList);
    socket.on('comment:new', onNew);

    return () => {
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

  return { comments, postComment };
}
