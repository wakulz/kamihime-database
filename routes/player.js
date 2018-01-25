const sql = require('sqlite');

module.exports = {
    async execute(req, res, blacklist) {
        let backEnd_err;
        try {

                if(Object.keys(req.params).length === 0)
                        return res.send('|Eros|Invalid API request: empty query.');
                // localhost/player/{khID}/{ep}/{resource2}
                const row  =  await sql.get(`SELECT * FROM kamihime WHERE khID='${req.params.id}'`);
                const episode = req.params.ep;
                let visitor = blacklist.get(req.ip) || null;

                if(!row)
                        throw backEnd_err = '|Eros|Invalid API Request: character does not exist.';
                else if( !(episode > 1 && episode < 4) )
                        throw backEnd_err = '|Eros|Invalid API Request: selected episode is beyond valid episodes.';
                else if( (row.khEidolon && episode == 3) || (row.khRare && episode == 3) || (row.khSoul && episode == 3))
                        throw backEnd_err = '|Eros|Invalid API Request: Eidolon/Rare/SSRA cannot contain third harem episode.';
                else if( (!row.khHarem_hentai1Resource2 && episode == 2) ||
                        (!row.khHarem_hentai2Resource2 && episode == 3) )
                        throw backEnd_err = '|Eros|Invalid API Request: no such episode found.';
                else if( !((episode == 2 && row.khHarem_hentai1Resource2 === req.params.res) || (episode == 3 && row.khHarem_hentai2Resource2 === req.params.res)) )
                        throw backEnd_err = '|Eros|Invalid API Request: Resource Directory input does not match within my records.'

                visitor && (Date.now() - blacklist.get(req.ip).expiration > 1000 * 60 * 60)
                        ? blacklist.delete(req.ip)
                        : null;
                if(!visitor) {
                        await sql.run(`UPDATE kamihime SET peekedOn=${row.peekedOn + 1} WHERE khID='${row.khID}'`);
                        blacklist.set(req.ip, { address: req.ip, expiration: Date.now() });
                        visitor = blacklist.get(req.ip);
                        console.log(`PeekedOn Ratelimit: Added ${visitor.address} from ${new Date(visitor.expiration).toLocaleString()}`);
                }
                res.render(`player`, { json: row, ep: episode });
        }
        catch (err) {
                if(backEnd_err)
                        res.send(err.toString().replace(/'/g, ''));
                else
                        console.log(err.stack);
        }
    }
};