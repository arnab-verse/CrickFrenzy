import React from 'react';
import { CricketTeam } from '../tournament/types';
import { CountryFlag } from './CountryFlag';

interface TeamBadgeProps {
  team?: CricketTeam | null;
  code?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  variant?: 'flag' | 'crest' | 'circle';
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  team,
  code,
  name,
  size = 'md',
  className = '',
  variant = 'flag',
}) => {
  const teamId = team?.id || code || team?.shortName || name;
  const teamName = team?.name || name || team?.shortName || code || 'Team';

  if (variant === 'circle') {
    return (
      <CountryFlag
        countryIdOrCode={teamId}
        name={teamName}
        size={size}
        aspect="circle"
        className={className}
      />
    );
  }

  return (
    <CountryFlag
      countryIdOrCode={teamId}
      name={teamName}
      size={size}
      aspect="flag"
      className={className}
    />
  );
};

