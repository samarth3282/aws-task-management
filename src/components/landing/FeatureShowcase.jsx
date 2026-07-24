import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import Reveal from "./Reveal.jsx";
import { useMacWindow } from "../../hooks/useMacWindow";
import TaskflowLogo from "../ui/TaskflowLogo.jsx";

function MockupDockIcon({ id, windowId, isMinimized }) {
  return (
    <div 
      id={id}
      style={{
        position: 'absolute',
        bottom: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: isMinimized ? 1 : 0,
        pointerEvents: isMinimized ? 'auto' : 'none',
        transition: 'opacity 0.4s var(--ease-out)',
        cursor: 'pointer',
        padding: '12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '24px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
      }}
      onClick={(e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('restore-mac-window', { detail: { id: windowId } }));
      }}
    >
      <TaskflowLogo style={{ width: '48px', height: '48px' }} />
    </div>
  );
}

const FEATURES = [
  {
    id: "board",
    eyebrow: "01 - Board",
    title: "One board, every status",
    body: "Drag a task from To Do to Done and it lands instantly - the UI updates first and only rolls back if the API call actually fails, the same optimistic pattern Linear and Trello use.",
    points: ["Per-column “Add task” with status baked in", "Optimistic drag-and-drop, no spinner lag", "Priority and due date visible at a glance"],
    Mockup: BoardMockup,
  },
  {
    id: "detail",
    eyebrow: "02 - Detail",
    title: "Every task has a thread",
    body: "Click a card and the conversation opens beside it - description, assignee, due date, and a running comment thread so decisions live next to the work, not in a separate chat.",
    points: ["Reassign without leaving the panel", "Comments sorted oldest → newest by design", "Nothing here uses alert() or confirm()"],
    Mockup: DetailMockup,
  },
  {
    id: "analytics",
    eyebrow: "03 - Analytics",
    title: "See the shape of the work",
    body: "A workspace overview turns raw task rows into something you can read in five seconds - what's open, what's moving, and what shipped this week.",
    points: ["Live counts by status and priority", "Per-member workload at a glance", "No separate BI tool required"],
    Mockup: AnalyticsMockup,
  },
];

export default function FeatureShowcase() {
  return (
    <section id="product" className="showcase">
      <div className="container">
        <Reveal as="div" className="showcase__head">
          <span className="eyebrow">Product</span>
          <h2 className="section-title">
            Built like a tool people <em>keep</em> using
          </h2>
          <p className="section-lede">
            Three screens, three jobs. Nothing you have to learn from a help center.
          </p>
        </Reveal>

        <div className="showcase__list">
          {FEATURES.map((f, i) => (
            <div key={f.id} className={`showcase__row ${i % 2 === 1 ? "showcase__row--reverse" : ""}`}>
              <Reveal as="div" className="showcase__text" x={i % 2 === 1 ? 24 : -24}>
                <span className="showcase__eyebrow">{f.eyebrow}</span>
                <h3 className="showcase__title">{f.title}</h3>
                <p className="showcase__body">{f.body}</p>
                <ul className="showcase__points">
                  {f.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Reveal>
              <Reveal as="div" className="showcase__visual" delay={0.1} y={36}>
                <f.Mockup />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoardMockup() {
  const { domRef, isMinimized, isMaximized, handleMinimize, handleMaximize } = useMacWindow('board-mockup', { targetSelector: '#board-mockup-dock-icon' });
  const [cols, setCols] = useState([
    { label: "To do", accent: "var(--slate-400)", cards: [{ id: "c1", text: "Spec the invite-by-email flow" }, { id: "c2", text: "Draft empty-state copy" }] },
    { label: "In progress", accent: "var(--amber-400)", cards: [{ id: "c3", text: "Kanban drag-and-drop" }] },
    { label: "Done", accent: "var(--teal-400)", cards: [{ id: "c4", text: "Cognito JWT authorizer" }, { id: "c5", text: "Pre-signed S3 uploads" }] },
  ]);
  const [addingToCol, setAddingToCol] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [draggedCard, setDraggedCard] = useState(null);

  const handleDragStart = (e, card, sourceColIndex) => {
    setDraggedCard({ card, sourceColIndex });
    // e.dataTransfer.effectAllowed = "move";
    // We can set a blank drag image to just use default browser ghost
  };

  const handleDrop = (e, targetColIndex) => {
    e.preventDefault();
    if (!draggedCard) return;
    const { card, sourceColIndex } = draggedCard;
    if (sourceColIndex === targetColIndex) return;

    setCols((prev) => {
      const next = [...prev];
      // clone arrays
      next[sourceColIndex] = { ...next[sourceColIndex], cards: [...next[sourceColIndex].cards] };
      next[targetColIndex] = { ...next[targetColIndex], cards: [...next[targetColIndex].cards] };

      next[sourceColIndex].cards = next[sourceColIndex].cards.filter(c => c.id !== card.id);
      next[targetColIndex].cards.push(card);
      return next;
    });
    setDraggedCard(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleAddTask = (e, colIndex) => {
    e.preventDefault();
    if (!newTaskText.trim()) {
      setAddingToCol(null);
      return;
    }
    setCols((prev) => {
      const next = [...prev];
      next[colIndex] = { ...next[colIndex], cards: [...next[colIndex].cards] };
      next[colIndex].cards.push({ id: Date.now().toString(), text: newTaskText });
      return next;
    });
    setNewTaskText("");
    setAddingToCol(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div ref={domRef} className={`mockup-frame ${isMaximized ? 'is-maximized' : ''}`}>
        <MockupChrome label="board" onMinimize={handleMinimize} />
        <div className="mini-board">
          {cols.map((c, i) => (
            <div 
              key={c.label} 
              className="mini-board__col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
            >
              <div className="mini-board__col-head">
                <span style={{ background: c.accent }} />
                {c.label}
              </div>
              {c.cards.map((card) => (
                <div 
                  key={card.id} 
                  className="mini-board__card" 
                  style={{ borderLeftColor: c.accent, cursor: 'grab' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card, i)}
                >
                  {card.text}
                </div>
              ))}
              
              {addingToCol === i ? (
                <form onSubmit={(e) => handleAddTask(e, i)}>
                  <input
                    type="text"
                    autoFocus
                    className="mini-board__input"
                    placeholder="Task title..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onBlur={(e) => handleAddTask(e, i)}
                  />
                </form>
              ) : (
                <div className="mini-board__add" onClick={() => setAddingToCol(i)} style={{ cursor: 'pointer' }}>
                  + Add task
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <MockupDockIcon id="board-mockup-dock-icon" windowId="board-mockup" isMinimized={isMinimized} />
    </div>
  );
}

function DetailMockup() {
  const { domRef, isMinimized, isMaximized, handleMinimize, handleMaximize } = useMacWindow('detail-mockup', { targetSelector: '#detail-mockup-dock-icon' });
  
  const [comments, setComments] = useState([
    { id: 1, author: "Samarth", avatar: "SP", time: "2h ago", text: "Went with a mapping table instead of a GSI on the Set attribute." },
    { id: 2, author: "Riya", avatar: "RK", time: "34m ago", text: "Makes sense - ships the O(1) query either direction." }
  ]);
  const [newComment, setNewComment] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newComment.trim()) {
      e.preventDefault();
      setComments([...comments, {
        id: Date.now(),
        author: "You",
        avatar: "U",
        time: "Just now",
        text: newComment
      }]);
      setNewComment("");
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div ref={domRef} className={`mockup-frame ${isMaximized ? 'is-maximized' : ''}`}>
        <MockupChrome label="task · TSK-115" onMinimize={handleMinimize} />
        <div className="mini-detail">
          <div className="mini-detail__meta">
            <span className="pill pill--amber">HIGH</span>
            <span className="mini-detail__due">Due Fri, Jul 24</span>
            <span className="mini-detail__avatar">RK</span>
          </div>
          <h4>Threaded task comments</h4>
          <p>Add a Comments table keyed by TaskID, sorted oldest-to-newest by an ISO-prefixed sort key.</p>
          <div className="mini-detail__divider" />
          
          {comments.map(c => (
            <div key={c.id} className="mini-detail__comment">
              <span className="mini-detail__avatar mini-detail__avatar--sm">{c.avatar}</span>
              <div style={{ width: '100%' }}>
                <p className="mini-detail__comment-head">
                  {c.author} <time>{c.time}</time>
                  {c.author === "You" && (
                    <span 
                      style={{ float: 'right', cursor: 'pointer', color: 'var(--slate-400)', display: 'flex', alignItems: 'center' }}
                      onClick={() => setComments(comments.filter(comment => comment.id !== c.id))}
                      title="Delete comment"
                    >
                      <Trash2 size={12} />
                    </span>
                  )}
                </p>
                <p className="mini-detail__comment-body">{c.text}</p>
              </div>
            </div>
          ))}

          <input 
            type="text" 
            className="mini-detail__input" 
            placeholder="Write a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <MockupDockIcon id="detail-mockup-dock-icon" windowId="detail-mockup" isMinimized={isMinimized} />
    </div>
  );
}

function AnalyticsMockup() {
  const { domRef, isMinimized, isMaximized, handleMinimize, handleMaximize } = useMacWindow('analytics-mockup', { targetSelector: '#analytics-mockup-dock-icon' });
  const bars = [38, 52, 44, 68, 58, 74, 62];
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div ref={domRef} className={`mockup-frame ${isMaximized ? 'is-maximized' : ''}`}>
        <MockupChrome label="dashboard" onMinimize={handleMinimize} />
        <div className="mini-analytics">
          <div className="mini-analytics__stats">
            <div>
              <span>12</span>
              <p>Open</p>
            </div>
            <div>
              <span>5</span>
              <p>In progress</p>
            </div>
            <div>
              <span>27</span>
              <p>Done this month</p>
            </div>
          </div>
          <div className="mini-analytics__chart">
            {bars.map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mini-analytics__legend">
            <span><i style={{ background: "var(--slate-400)" }} /> Backlog</span>
            <span><i style={{ background: "var(--amber-400)" }} /> In progress</span>
            <span><i style={{ background: "var(--teal-400)" }} /> Done</span>
          </div>
        </div>
      </div>
      <MockupDockIcon id="analytics-mockup-dock-icon" windowId="analytics-mockup" isMinimized={isMinimized} />
    </div>
  );
}

function MockupChrome({ label, onMinimize }) {
  return (
    <div className="mockup-frame__chrome">
      <div className="board-mockup__dots">
        <span onClick={onMinimize} />
        <span onClick={onMinimize} />
        <span />
      </div>
      <span className="mockup-frame__label">{label}</span>
    </div>
  );
}
