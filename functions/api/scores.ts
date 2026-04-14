interface Env {
    DB: D1Database;
}

interface ScoreRow {
    movie_title: string;
    initials: string;
    score: number;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequest: PagesFunction<Env> = async (ctx) => {
    if (ctx.request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }
    if (ctx.request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const categories = ['highestProfit', 'greatestRevenue', 'bestPctReturned', 'biggestBomb'] as const;
    const result: Record<string, ScoreRow[]> = {};

    for (const cat of categories) {
        const { results } = await ctx.env.DB.prepare(
            'SELECT movie_title, initials, score FROM scores WHERE category = ? ORDER BY score DESC LIMIT 5'
        ).bind(cat).all<ScoreRow>();
        result[cat] = results;
    }

    return Response.json(result, { headers: CORS_HEADERS });
};
