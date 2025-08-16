import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../utils/api';
import { tagsData } from '../../data/tags';
import './Student.css';

const EditProfile: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const data = await userAPI.getInterests();
        setSelectedTags(new Set(data.interests));
      } catch (err) {
        setError('Failed to load your interests.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterests();
  }, []);

  const handleTagClick = (tag: string) => {
    const newSelectedTags = new Set(selectedTags);
    if (newSelectedTags.has(tag)) {
      newSelectedTags.delete(tag);
    } else {
      newSelectedTags.add(tag);
    }
    setSelectedTags(newSelectedTags);
  };

  const handleSave = async () => {
    try {
      const interests = Array.from(selectedTags);
      await userAPI.updateInterests(interests);
      alert('Your preferences have been saved!');
    } catch (err) {
      alert('Failed to save preferences. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading your preferences...</div>;
  }

  return (
    <div className="edit-profile-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Edit Profile</h1>
          <div className="header-actions">
            <Link to="/student" className="back-to-dashboard-button">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="profile-form-container">
          <h2>Your Interests</h2>
          <p>Select the tags you're interested in to get relevant event recommendations.</p>
          
          {error && <div className="error-message">{error}</div>}

          {Object.entries(tagsData).map(([category, tags]) => (
            <div key={category} className="tag-category">
              <h3>{category}</h3>
              <div className="tag-grid">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-button ${selectedTags.has(tag) ? 'selected' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="profile-actions">
            <button className="save-profile-button" onClick={handleSave}>
              Save Preferences
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
