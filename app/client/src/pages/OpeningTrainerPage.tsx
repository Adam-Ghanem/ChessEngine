import { Target } from "lucide-react";
import { ProductHeader } from "@/components/ProductHeader";

export default function OpeningTrainerPage() {
  return <main className="app-shell chessiq-shell openings-shell"><ProductHeader /><section className="opening-trainer-shell"><Target size={26}/><p className="eyebrow">ChessIQ repertoire training</p><h1>Opening Trainer</h1><p>Choose a line from the Explorer while the interactive recall workspace is prepared.</p></section></main>;
}
