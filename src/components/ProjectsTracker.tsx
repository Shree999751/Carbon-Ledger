import React, { useState } from 'react';
import {
  Folder,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Check,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ComplianceProject } from '../types/ghg';

interface ProjectsTrackerProps {
  projects: ComplianceProject[];
  onUpdateProject?: (updated: ComplianceProject) => void;
  onAddProject?: (project: ComplianceProject) => void;
  onOpenDriveFolder?: (folderName?: string) => void;
}

export const ProjectsTracker: React.FC<ProjectsTrackerProps> = ({
  projects,
  onUpdateProject,
  onAddProject,
  onOpenDriveFolder,
}) => {
  const [filter, setFilter] = useState<'all' | 'running' | 'overdue' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<ComplianceProject['category']>('reporting');
  const [newTargetDate, setNewTargetDate] = useState('2026-10-15');
  const [newPhaseName, setNewPhaseName] = useState('Data Collection');
  const [newPhaseTotal, setNewPhaseTotal] = useState(5);

  // Helper for computing days difference
  const getDaysDiff = (targetDateStr: string) => {
    const today = new Date('2026-09-08'); // Anchored close to reference portal date
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'running') return p.status === 'running';
    if (filter === 'overdue') return p.status === 'overdue' || getDaysDiff(p.targetDate) < 0;
    if (filter === 'completed') return p.status === 'completed';
    return true;
  });

  const runningCount = projects.filter((p) => p.status === 'running' || p.status === 'overdue').length;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const generatedCode = newCode.trim() || `PR0${Math.floor(Math.random() * 90 + 10)}`;
    const newProj: ComplianceProject = {
      id: `proj-${Date.now()}`,
      code: generatedCode,
      title: newTitle.trim(),
      category: newCategory,
      targetDate: newTargetDate,
      status: 'running',
      phaseCurrent: 1,
      phaseTotal: Number(newPhaseTotal) || 4,
      phaseName: newPhaseName.trim() || 'Setup & Onboarding',
      progressPct: 15,
      nextMilestone: 'Gather preliminary operational activity data',
      gateText: 'Account Manager sign-in',
      cardFooterStatus: 'CLEAR',
      driveFolder: `01: Deliverables / ${newTitle.trim()}`,
    };
    if (onAddProject) onAddProject(newProj);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewCode('');
  };

  return (
    <div className="compliance-projects-container">
      {/* Section Header */}
      <div className="projects-header-row">
        <div className="projects-header-left">
          <span className="projects-section-title">PROJECTS</span>
          <span className="projects-count-badge">RUNNING {runningCount} projects</span>
        </div>

        <div className="projects-header-actions">
          <div className="projects-filter-pills">
            <button
              type="button"
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({projects.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'running' ? 'active' : ''}`}
              onClick={() => setFilter('running')}
            >
              Running
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'overdue' ? 'active' : ''}`}
              onClick={() => setFilter('overdue')}
            >
              Overdue
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>

          <button
            type="button"
            className="add-project-btn"
            onClick={() => setIsAddModalOpen(true)}
            title="Add new compliance cycle or sustainability project"
          >
            <Plus size={16} />
            <span>New Deliverable</span>
          </button>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="projects-grid">
        {filteredProjects.map((p) => {
          const daysDiff = getDaysDiff(p.targetDate);
          const isOverdue = p.status === 'overdue' || (p.status !== 'completed' && daysDiff < 0);
          const isCompleted = p.status === 'completed';

          // Format readable target date
          const dateObj = new Date(p.targetDate);
          const formattedDate = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : p.targetDate;

          return (
            <div
              key={p.id}
              className={`project-card ${isOverdue ? 'card-overdue' : ''} ${isCompleted ? 'card-completed' : ''}`}
            >
              {/* Top Banner (Crimson for overdue, Amber for days remaining, Green for done) */}
              <div className={`project-banner ${isOverdue ? 'banner-overdue' : isCompleted ? 'banner-completed' : 'banner-upcoming'}`}>
                <div className="banner-left">
                  {isOverdue ? (
                    <span>{Math.abs(daysDiff)} DAYS OVERDUE</span>
                  ) : isCompleted ? (
                    <span>COMPLETED</span>
                  ) : (
                    <span>{daysDiff} DAYS TO GO</span>
                  )}
                </div>
                <div className="banner-right">{formattedDate}</div>
              </div>

              {/* Card Body */}
              <div className="project-card-body">
                {/* Status & Phase Badges */}
                <div className="card-sub-header">
                  <span className={`status-tag status-${p.status}`}>
                    <span className="status-dot" />
                    {p.status.toUpperCase()}
                  </span>
                  <span className="phase-count-tag">
                    PHASE {p.phaseCurrent} OF {p.phaseTotal}
                  </span>
                </div>

                {/* Title & Code */}
                <div className="project-title-block">
                  <h4 className="project-title">{p.title}</h4>
                  <span className="project-code">{p.code}</span>
                </div>

                {/* Current Phase & Progress Bar */}
                <div className="phase-section">
                  <div className="phase-header-row">
                    <span className="phase-label">CURRENT PHASE</span>
                  </div>
                  <div className="phase-name">{p.phaseName}</div>
                  <div className="phase-progress-track">
                    <div
                      className="phase-progress-fill"
                      style={{ width: `${Math.min(100, Math.max(8, p.progressPct))}%` }}
                    />
                  </div>
                </div>

                {/* Next Milestone / Gate Requirement */}
                <div className="milestone-block">
                  {p.gateText ? (
                    <div className="gate-row">
                      <span className="gate-pill">GATE</span>
                      <span className="gate-text">{p.gateText}</span>
                    </div>
                  ) : null}
                  {p.nextMilestone ? (
                    <div className="next-action-text" title={p.nextMilestone}>
                      {p.nextMilestone}
                    </div>
                  ) : null}
                </div>

                {/* Card Footer */}
                <div className="project-card-footer">
                  <span className={`footer-status-pill status-${p.cardFooterStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {p.cardFooterStatus}
                  </span>

                  <button
                    type="button"
                    className="drive-icon-btn"
                    title={`Open Evidence Folder: ${p.driveFolder || 'Google Drive'}`}
                    onClick={() => onOpenDriveFolder && onOpenDriveFolder(p.driveFolder)}
                  >
                    <svg width="18" height="18" viewBox="0 0 87.3 78" className="drive-svg-icon">
                      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335"/>
                      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">New Compliance Deliverable</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="modal-body">
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="field-label">Deliverable / Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO 14064-1 Carbon Verification"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid-2col" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label className="field-label">Project Code</label>
                  <input
                    type="text"
                    placeholder="e.g. PR042"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                  >
                    <option value="consultation">Consultation</option>
                    <option value="reporting">Reporting (CSRD/ESG)</option>
                    <option value="dashboarding">Data Dashboarding</option>
                    <option value="assessment">Assessment (EcoVadis)</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>
              </div>

              <div className="grid-2col" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label className="field-label">Target Completion Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">Total Phases</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newPhaseTotal}
                    onChange={(e) => setNewPhaseTotal(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="field-label">Initial Phase Name</label>
                <input
                  type="text"
                  placeholder="e.g. Onboarding & Baseline Scoping"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Deliverable Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
