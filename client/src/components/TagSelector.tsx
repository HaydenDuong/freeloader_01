import React, { useState, useRef, useEffect } from 'react';
import { tagsData } from '../data/tags';
import './TagSelector.css';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
  disabled = false,
  placeholder = "Select tags for your event..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    if (isSelected) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  // Remove individual tag
  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // Filter tags based on search
  const getFilteredTags = () => {
    if (!searchTerm) return tagsData;
    
    const filtered: { [key: string]: string[] } = {};
    Object.entries(tagsData).forEach(([category, tags]) => {
      const matchingTags = tags.filter(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingTags.length > 0) {
        filtered[category] = matchingTags;
      }
    });
    return filtered;
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const filteredTags = getFilteredTags();
  const hasResults = Object.keys(filteredTags).length > 0;

  return (
    <div className="tag-selector-container" ref={containerRef}>
      {/* Input Field */}
      <div 
        className={`tag-selector-input ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleInputClick}
      >
        {/* Selected Tags Display */}
        <div className="selected-tags">
          {selectedTags.map(tag => (
            <span key={tag} className="selected-tag">
              {tag}
              {!disabled && (
                <button
                  type="button"
                  className="remove-tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
          
          {/* Placeholder or Search Input */}
          {selectedTags.length === 0 && !isOpen && (
            <span className="tag-placeholder">{placeholder}</span>
          )}
          
          {isOpen && (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tags..."
              className="tag-search-input"
            />
          )}
        </div>

        {/* Dropdown Arrow */}
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </div>
      </div>

      {/* Tags Popup */}
      {isOpen && (
        <div className="tag-selector-popup">
          {hasResults ? (
            <div className="tag-categories">
              {Object.entries(filteredTags).map(([category, tags]) => (
                <div key={category} className="tag-category">
                  <h4 className="category-title">
                    {category === 'Goods' && '🎁'} 
                    {category === 'Topic' && '📚'} 
                    {category === 'Career' && '💼'} 
                    {category === 'Entertainment' && '🎉'} 
                    {category}
                  </h4>
                  <div className="tag-grid">
                    {tags.map(tag => (
                      <label key={tag} className="tag-option">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                          className="tag-checkbox"
                        />
                        <span className="tag-label">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No tags found for "{searchTerm}"</p>
              <small>Try a different search term</small>
            </div>
          )}
          
          {/* Footer */}
          <div className="tag-selector-footer">
            <div className="selected-count">
              {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
            </div>
            <button
              type="button"
              className="close-popup-btn"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
