import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloorplansClient from '@/components/FloorplansClient';

export const metadata: Metadata = {
  title: 'Floorplans — B on the Sea',
  description: 'Explore the Main Level Floorplan and Entertainment Deck at B on the Sea, Anguilla.',
};

type Asset = {
  src: string;
  name: string;
};

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|svg)$/i;

function toPublicUrl(filePath: string) {
  const publicDir = path.join(process.cwd(), 'public');

  const relativePath = path
    .relative(publicDir, filePath)
    .split(path.sep)
    .map(encodeURIComponent)
    .join('/');

  return `/${relativePath}`;
}

function getAssets(directory: string): Asset[] {
  try {
    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs
      .readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.test(entry.name))
      .map((entry) => ({
        name: entry.name,
        src: toPublicUrl(path.join(directory, entry.name)),
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      );
  } catch {
    return [];
  }
}

function getAssetFromFile(filePath: string): Asset | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const name = path.basename(filePath);

    if (!IMAGE_EXTENSIONS.test(name)) {
      return null;
    }

    return {
      name,
      src: toPublicUrl(filePath),
    };
  } catch {
    return null;
  }
}

function getFirstAsset(directories: string[]): Asset | null {
  for (const directory of directories) {
    const assets = getAssets(directory);

    if (assets.length > 0) {
      return assets[0];
    }
  }

  return null;
}

export default function FloorplansPage() {
  const uploads = path.join(process.cwd(), 'public', 'uploads');

  /*
   * ============================================================
   * MAIN LEVEL FLOORPLAN
   * ============================================================
   *
   * The page first looks in:
   *
   * public/uploads/aboutvillab/floorplans
   *
   * If your SVG is somewhere else, the fallback directories
   * below will also be checked.
   */

  const floorplan =
    getAssetFromFile(path.join(process.cwd(), 'public', 'images', 'mainlevel-floorplan.jpg')) ??
    getFirstAsset([
      path.join(uploads, 'aboutvillab', 'floorplans'),

      path.join(uploads, 'aboutvillab', 'mainlevel'),

      path.join(uploads, 'aboutvillab', 'files'),

      path.join(uploads, 'files', 'images', '1'),
    ]);

  /*
   * ============================================================
   * ENTERTAINMENT DECK
   * ============================================================
   */

  const entertainment =
    getAssetFromFile(
      path.join(process.cwd(), 'public', 'images', 'entertainment-deck-floorplan.jpg')
    ) ??
    getFirstAsset([
      path.join(uploads, 'aboutvillab', 'entertainmentdeck'),

      path.join(uploads, 'aboutvillab', 'viewmainlevel'),
    ]);

  return (
    <>
      <Header />

      <FloorplansClient floorplan={floorplan} entertainment={entertainment} />

      <Footer />
    </>
  );
}
