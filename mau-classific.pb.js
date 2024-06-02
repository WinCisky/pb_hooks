/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/mau/classific/seasonal/:page", (c) => {

    const summer = "Estate";
    const winter = "Inverno";
    const spring = "Primavera";
    const fall = "Autunno";

    const page = c.pathParam("page")

    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    let season = winter;
    if (month >= 0 && month < 3) season = winter;
    if (month >= 3 && month < 6) season = spring;
    if (month >= 6 && month < 9) season = summer;
    if (month >= 9 && month < 12) season = fall;

    const result = arrayOf(new DynamicModel({
        // describe the shape of the data (used also as initial values)
        "id": "",
        "slug": "",
        "title_eng": "",
        "type": "",
        "imageurl": "",
        "studio": "",
	"dub": "",
        "number": 0
    }));

    const query = `
        SELECT
            anime.id,
            anime.slug,
            anime.title_eng,
            anime.type,
            anime.imageurl,
            anime.studio,
            anime.dub,
            MAX(episode.number) as number
        FROM mau_episodes as episode
        LEFT JOIN mau_anime as anime ON anime.id = episode.anime
        WHERE anime.season = {:season} AND anime.date = {:year}
        GROUP BY anime.id
        ORDER BY anime.score DESC
        LIMIT 20
        OFFSET {:offset}
    `;

    try{
        $app.dao().db()
            .newQuery(query)
            .bind({
                "season": season,
                "year": year,
                "offset": (page - 1) * 20
            })
            .all(result) // throw an error on db failure
    } catch (e) {
        return c.json(500, {error: e.message})
    }

    return c.json(200, { "items" : result })
})
