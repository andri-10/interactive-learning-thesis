import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (displayChildren.type !== children.type) {
      // Start fade out
      setIsVisible(false);
      
      // After fade out completes, update content and fade in
      setTimeout(() => {
        setDisplayChildren(children);
        setIsVisible(true);
      }, 150);
    } else {
      setDisplayChildren(children);
      setIsVisible(true);
    }
  }, [children, displayChildren]);

  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.15s ease-in-out',
      width: '100%'
    }}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;