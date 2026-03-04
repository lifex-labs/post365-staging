import { useState } from 'react';
import { Plus } from 'lucide-react';
import PostCard from '../components/PostCard';
import { POSTS } from '../data/posts';
import styles from './PostsPage.module.css';

export default function PostsPage() {
  const [posts, setPosts] = useState(POSTS);

  function handleDelete(id) {
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Posts</h1>
          <p className={styles.description}>Create, manage and schedule all your content posts in one place.</p>
        </div>
        <button className={styles.newBtn}>
          <Plus size={15} strokeWidth={2.5} />
          New post
        </button>
      </header>
      <div className={styles.grid}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
