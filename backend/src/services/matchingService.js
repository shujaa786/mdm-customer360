// Levenshtein Distance Algorithm for fuzzy string matching
function levenshteinDistance(str1, str2) {
  const matrix = Array(str1.length + 1).fill().map(() => Array(str2.length + 1).fill(0));

  for (let i = 0; i <= str2.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str1.length; j++) matrix[j][0] = j;

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[str1.length][str2.length];
}

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

// Main MDM matching function
async function findPotentialMatches(Entity) {
  const allEntities = await Entity.find({ isGolden: false });
  const matches = [];

  for (let i = 0; i < allEntities.length; i++) {
    for (let j = i + 1; j < allEntities.length; j++) {
      const a = allEntities[i];
      const b = allEntities[j];

      let score = 0;

      // Exact email or phone = very high score
      if (normalize(a.email) === normalize(b.email)) score += 50;
      if (normalize(a.phone) === normalize(b.phone)) score += 40;

      // Fuzzy name matching
      const fullNameA = normalize(a.firstName + ' ' + a.lastName);
      const fullNameB = normalize(b.firstName + ' ' + b.lastName);
      const nameScore = 100 - levenshteinDistance(fullNameA, fullNameB);
      score += Math.max(0, nameScore * 0.6);

      if (score >= 65) {
        matches.push({
          entity1: a._id.toString(),
          entity2: b._id.toString(),
          score: Math.round(score),
          reason: score > 80 ? 'Strong match (email/phone)' : 'Fuzzy name match'
        });
      }
    }
  }

  return matches;
}

module.exports = { findPotentialMatches, levenshteinDistance };