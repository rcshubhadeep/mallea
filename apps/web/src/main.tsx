import { createRoot } from 'react-dom/client';
import { App } from '../../../packages/runtime/App';
import { StudioApp } from '../../../packages/runtime/studio/StudioApp';
createRoot(document.getElementById('root')!).render(location.search.includes('legacy')?<App kind="board"/>:<StudioApp kind="review-board"/>);
