import React from 'react';
import { useRouter } from 'expo-router';
import { LinkBox, type LinkBoxProps } from '@plocks/ui';

export interface RouteLinkProps extends Omit<LinkBoxProps, 'onNavigate'> {
  /** Runs after an ordinary click navigates within the app. */
  onNavigate?: () => void;
}

/** Connects plocks' block link to Expo Router's client navigation. */
export function RouteLink({ href, onNavigate, ...props }: RouteLinkProps) {
  const router = useRouter();
  return (
    <LinkBox
      {...props}
      href={href}
      onNavigate={() => {
        router.push(href as never);
        onNavigate?.();
      }}
    />
  );
}
