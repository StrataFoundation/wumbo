import { classNames } from '../utils';
import React from 'react';

export const LeaderboardNumber = React.memo(({ children = null as any, selected = false }: { children: any, selected?: boolean }) => 
  <div className={classNames("w-10 font-semibold text-sm text-center", selected ? "text-gray-700" : "text-gray-400")}>
    {children}
  </div>
)
