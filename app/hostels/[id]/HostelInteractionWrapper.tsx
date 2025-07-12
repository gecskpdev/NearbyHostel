"use client";
import HostelInteraction from './HostelInteraction';
 
export default function HostelInteractionWrapper({ hostelId }: { hostelId: string }) {
  return <HostelInteraction hostelId={hostelId} />;
} 