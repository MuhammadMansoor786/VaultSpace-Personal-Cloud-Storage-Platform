/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FolderView } from './components/FolderView';
import { FileGrid } from './components/FileGrid';
import { TimelineView } from './components/TimelineView';
import { DuplicatesView } from './components/DuplicatesView';
import { BackupRecoveryView } from './components/BackupRecoveryView';
import { SystemHealthView } from './components/SystemHealthView';
import { FileUploadModal } from './components/FileUploadModal';
import { NewFolderModal } from './components/NewFolderModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { FileVersionModal } from './components/FileVersionModal';
import {
  Folder,
  Image,
  Video,
  FileText,
  Music,
  Star,
  Trash2,
  HardDrive,
  Copy,
  Clock,
  ShieldAlert,
  Server,
} from 'lucide-react';

const VaultDashboard: React.FC = () => {
  const {
    activeTab,
    currentFolderId,
    activePreviewFile,
    setActivePreviewFile,
    activeVersionFile,
    setActiveVersionFile,
  } = useVault();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

  const getTabHeader = () => {
    switch (activeTab) {
      case 'photos':
        return { title: 'Photos Gallery', desc: 'Personal photo collection with high-res lightbox and EXIF viewer', icon: Image };
      case 'videos':
        return { title: '4K Video Library', desc: 'Encrypted video stream with speed controls and theater mode', icon: Video };
      case 'documents':
        return { title: 'Confidential Documents', desc: 'Secure PDFs, spreadsheets, Word documents, and archives', icon: FileText };
      case 'audio':
        return { title: 'Audio & Voice Memos', desc: 'High-fidelity audio recordings and acoustic tracks', icon: Music };
      case 'favorites':
        return { title: 'Starred Favorites', desc: 'Quick access to your most important files', icon: Star };
      case 'timeline':
        return { title: 'Vault Timeline', desc: 'Memories and file records ordered chronologically', icon: Clock };
      case 'duplicates':
        return { title: 'Duplicate Cleaner', desc: 'Detect and eliminate duplicate files with identical SHA-256 hashes', icon: Copy };
      case 'trash':
        return { title: 'Trash Quarantine', desc: 'Files retained for 30 days before permanent automatic purge', icon: Trash2 };
      case 'backup':
        return { title: 'Backup & Recovery Hub', desc: 'Export encrypted bundles and perform cryptographic health checks', icon: ShieldAlert };
      case 'system':
        return { title: 'System & Security Health', desc: 'Storage quotas, Zero-Knowledge encryption status, and event audit trails', icon: Server };
      default:
        return { title: 'All Files & Folders', desc: 'Zero-knowledge personal cloud storage root directory', icon: HardDrive };
    }
  };

  const header = getTabHeader();
  const HeaderIcon = header.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500/20">
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        onOpenNewFolderModal={() => setIsNewFolderModalOpen(true)}
      />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Header Title Banner */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <HeaderIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {header.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {header.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Active View Routing */}
          {activeTab === 'timeline' ? (
            <TimelineView />
          ) : activeTab === 'duplicates' ? (
            <DuplicatesView />
          ) : activeTab === 'backup' ? (
            <BackupRecoveryView />
          ) : activeTab === 'system' ? (
            <SystemHealthView />
          ) : (
            <>
              {/* Show Folder Hierarchy only when in 'files' mode */}
              {activeTab === 'files' && (
                <FolderView onOpenCreateFolder={() => setIsNewFolderModalOpen(true)} />
              )}
              <FileGrid onOpenCreateFolder={() => setIsNewFolderModalOpen(true)} />
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <FileUploadModal />
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
      />
      {activePreviewFile && (
        <FilePreviewModal
          file={activePreviewFile}
          onClose={() => setActivePreviewFile(null)}
          onOpenVersions={file => setActiveVersionFile(file)}
        />
      )}
      {activeVersionFile && (
        <FileVersionModal
          file={activeVersionFile}
          onClose={() => setActiveVersionFile(null)}
        />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useVault();
  return isAuthenticated ? <VaultDashboard /> : <LandingPage />;
};

export default function App() {
  return (
    <VaultProvider>
      <AppContent />
    </VaultProvider>
  );
}
