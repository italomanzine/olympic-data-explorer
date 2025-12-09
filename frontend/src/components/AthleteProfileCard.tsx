"use client";

import React, { memo } from 'react';
import { User, MapPin, Ruler, Weight, Calendar, Trophy, Medal, X } from 'lucide-react';
import { AthleteProfile } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

interface AthleteProfileCardProps {
  profile: AthleteProfile;
  onClose: () => void;
}

function AthleteProfileCard({ profile, onClose }: AthleteProfileCardProps) {
  const { t, tSport, tCountry } = useLanguage();
  
  const countryName = tCountry(profile.noc) || profile.team;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
              <MapPin className="w-3 h-3" />
              <span>{countryName} ({profile.noc})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medals Summary */}
      <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50 border-b border-slate-100">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-1">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <span className="text-lg font-bold text-yellow-600">{profile.medals.gold}</span>
          <p className="text-[10px] text-slate-500 uppercase">{t('gold')}</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 flex items-center justify-center mb-1">
            <Medal className="w-5 h-5 text-slate-500" />
          </div>
          <span className="text-lg font-bold text-slate-500">{profile.medals.silver}</span>
          <p className="text-[10px] text-slate-500 uppercase">{t('silver')}</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-1">
            <Medal className="w-5 h-5 text-amber-700" />
          </div>
          <span className="text-lg font-bold text-amber-700">{profile.medals.bronze}</span>
          <p className="text-[10px] text-slate-500 uppercase">{t('bronze')}</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-1">
            <span className="text-sm font-bold text-blue-600">{profile.medals.total}</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{profile.medals.total}</span>
          <p className="text-[10px] text-slate-500 uppercase">{t('total')}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="p-4 space-y-4">
        {/* Biometrics */}
        <div className="grid grid-cols-3 gap-3">
          {profile.height && (
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{profile.height} cm</span>
            </div>
          )}
          {profile.weight && (
            <div className="flex items-center gap-2 text-sm">
              <Weight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{profile.weight} kg</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              {profile.years[0]} - {profile.years[profile.years.length - 1]}
            </span>
          </div>
        </div>

        {/* Sports */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t('sports_practiced')}
          </h4>
          <div className="flex flex-wrap gap-1">
            {profile.sports.map((sport: string) => (
              <span
                key={sport}
                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
              >
                {tSport(sport)}
              </span>
            ))}
          </div>
        </div>

        {/* Participations */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t('olympic_participations')} ({profile.participations.length})
          </h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {profile.participations.map((p: { year: number; event: string; medal: string | null }, idx: number) => (
              <div
                key={idx}
                className={`flex items-center justify-between text-xs p-2 rounded ${
                  p.medal ? 'bg-amber-50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{p.year}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 truncate max-w-[120px]" title={p.event}>
                    {p.event}
                  </span>
                </div>
                {p.medal && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    p.medal === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                    p.medal === 'Silver' ? 'bg-slate-200 text-slate-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {t(p.medal.toLowerCase())}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(AthleteProfileCard);
