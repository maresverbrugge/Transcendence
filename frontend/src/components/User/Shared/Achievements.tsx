import React from 'react';
import { AchievementsData } from '../interfaces';

function Achievements({ achievements = [] }: { achievements: AchievementsData[] }) {
  if (!Array.isArray(achievements) || achievements.length === 0) {
    return null;
  }

  return (
    <div className="px-0 py-3">
    <h2 className="text-center mb-3">Achievements</h2>
      <div className="d-flex flex-wrap justify-content-center">
        {achievements.map((achievement) => (
          <div key={achievement.name} className="text-center mx-2 my-2" style={{ flex: '0 0 20%', maxWidth: '20%' }}>
            <img
              src={achievement.iconURL}
              alt={achievement.name}
              className="rounded-circle"
              style={{
                width: '80%',
                height: 'auto',
                filter: achievement.unlocked ? 'none' : 'grayscale(100%)', // Apply grayscale dynamically
                opacity: achievement.unlocked ? 1 : 0.5, // Slightly fade out locked achievements
              }}
            />
            <p className="mt-1" style={{ fontSize: '90%' }}>
              {achievement.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
