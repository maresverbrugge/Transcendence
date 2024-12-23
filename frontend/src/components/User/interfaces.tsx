export interface StatisticsData {
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalScores: number;
  winRate: number;
  ladderRank: number;
  // achievements: Achievements;
}

export interface MatchHistoryData {
  opponent: string;
  scorePlayer1: number;
  scorePlayer2: number;
}

export interface LeaderboardData {
  username: string;
  avatarURL: string;
  ladderRank: number;
  rank: number;
}
