/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TaraOperationsMissionDeck, TaraOperationsMissionDeckProps } from './TaraOperationsMissionDeck';

/**
 * Re-exporting TaraOperationsMissionDeck as PixelOfficeCard for backwards compatibility,
 * permanently removing the office representation in favor of the futuristic mission deck.
 */
export const PixelOfficeCard: React.FC<any> = (props) => {
  return <TaraOperationsMissionDeck {...props} />;
};

export default PixelOfficeCard;
