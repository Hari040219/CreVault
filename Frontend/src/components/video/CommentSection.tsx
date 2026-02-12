import React, { useState } from 'react';
import { ThumbsUp, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Comment, formatDate } from '@/lib/mockData';

interface CommentSectionProps {
  comments: Comment[];
  videoId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments: initialComments, videoId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const comment: Comment = {
      id: 'c-' + Date.now(),
      videoId,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      content: newComment.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {comments.length} Comments
      </h3>

      {/* Add comment */}
      {isAuthenticated ? (
        <div className="mb-6 flex gap-4">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setNewComment('')}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mb-6 text-muted-foreground">
          Please <a href="/login" className="text-primary hover:underline">sign in</a> to comment.
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 animate-fade-in">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {comment.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {comment.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground">{comment.content}</p>
              <div className="mt-2 flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-xs">{comment.likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground hover:text-foreground"
                >
                  Reply
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
