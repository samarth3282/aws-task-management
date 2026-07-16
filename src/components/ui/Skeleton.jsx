import React from 'react';

export function Skeleton({ className = '', style, ...props }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 1, className = '', style, ...props }) {
  return (
    <div className={`skeleton-text-wrapper ${className}`} style={style} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className = '', style, ...props }) {
  return (
    <div className={`skeleton skeleton-avatar ${className}`} style={style} {...props} />
  );
}
