const Discord = require("discord.js");
const DisTube = require("distube");
const client = new Discord.Client({disableMentions: "everone"});
const config = {
    prefix: ".",
    token: "ODA2NDQ1MTc2NDIzNTc5Njk4.YBpimQ.SgjR4GPKccgn7rz369GJu4Ig61o"
}
const distube = new DisTube(client, {searchSongs: true, emitNewSongOnly: true, highWaterMark: 1<<25})

const filters = ["3d","bassboost","echo","karaoke","nightcore","vaporwave","flanger"];


//events
client.login(config.token);



client.on("ready", () =>{ //discordusername#1234
    console.log(`login!: ${client.user.tag}`);
    client.user.setActivity(".help",{type: "LISTENING"});
})

client.on("message", message => {
    if(message.author.bot){ return; }
    if(!message.guild) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift();

    if(command === "ping"){
        return embedbuilder(client, message, `sBLUE`, `🔴PING:🔴`, `\`${client.ws.ping} ms\``)
    }

    if(command === "help"){
        return embedbuilder(client, message, "PINK", `🆘💬Here all my command💬🆘`, "you can write in full word but if you lazy just use shortcut word 📝📝.\n\n \`.play/p\` `\.skip/s\` `\.pause/pu\` `\.resume/ru\` `\.stop/leave\` `\.seek/sk\` `\.volume/vol\` `\.jump/ju\` `\.queue/qu\` `\.loop/repeat\`\n\n Filter type \n `\.3d\` `\.bassboost\` `\.echo\` `\.karaoke\` `\.nightcore\` `\.vaporwave\` `\.flanger\`\n to close just type in again!! ")
    }


    if(command === "play" || command === "p"){
        embedbuilder(client, message, "YELLOW", "Searching!🕵️🧐", args.join(" "))
        return distube.play(message, args.join(" "));
    }


    if(command === "skip" || command === "s"){
        embedbuilder(client, message, "YELLOW", "SKIPPED!👌", "\`Skipped the song\`")
        return distube.skip(message);
    } 

    if(command ==="pause" || command === "pu"){
        embedbuilder(client, message, "PURPLE", "⏸PAUSE!⏸", "\`pause the song\`")
        return distube.pause(message);
    }


    if(command ==="resume" || command === "ru"){
        embedbuilder(client, message, "PURPLE", "▶️RESUME!▶️", "\`resume the song\`")
        return distube.resume(message);
    }

    if(command === "stop" || command === "leave"){
        embedbuilder(client, message, "RED", "❌STOPPED!❌", "\`See you again next time😉👋\`")
        return distube.stop(message);
    }


    if(command === "seek" || command === "sk"){
        embedbuilder(client, message, "PURPLE", "⏩Seeked!⏩", `seeked the song for \`${args[0]} seconds\``)
        return distube.seek(message, Number(args[0]*1000));
    } 


    if(filters.includes(command)) {
        let filter = distube.setFilter(message, command);
        return embedbuilder(client, message, "YELLOW", "Adding filter!", filter)
    }


    if(command === "volume" || command === "vol"){
        
        embedbuilder(client, message, "PURPLE", "🔊VOLUME!🔊", `changed volume to \`${args[0]} %\``)
        return distube.setVolume(message, args[0]);
    } 


    if (command === "queue" || command === "qu"){
        let queue = distube.getQueue(message);
        let curqueue = queue.songs.map((song, id) =>
        `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).join("\n");
        return  embedbuilder(client, message, "GREEN", "Current Queue!", curqueue)
    }


    if (command === "loop" || command === "repeat"){
        if(0 <= Number(args[0]) && Number(args[0]) <= 2){
            distube.setRepeatMode(message,parseInt(args[0]))
            embedbuilder(client, message, "GREEN", "🔁Repeat mode set to:!🔁", `${args[0].replace("0", "OFF").replace("1", "Repeat song").replace("2", "Repeat Queue")}`)
        }
        else{
            embedbuilder(client, message, "RED", "ERROR", `Please use a number between **0** and **2**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*`)
        }
    }


    if ( command === "jump" || command === "ju"){
        let queue = distube.getQueue(message);
        if(0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length){
            embedbuilder(client, message, "RED", "ERROR", `⏭Jumped ${parseInt(args[0])} songs!⏭`)
            return distube.jump(message, parseInt(args[0]))
            .catch(err => message.channel.send("Invalid song number."));
        }
        else{
            embedbuilder(client, message, "RED", "ERROR", `Please use a number between **0** and **${DisTube.getQueue(message).length}**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*`)
        }

    
    }

    

})

//queue
const status = (queue) => `Volume: \`${queue.volume}\` | Filter: \`${queue.filter || "OFF"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``
//distube
distube
     .on("playSong", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "🎵Playing new Song!🎵", `Song: \`${song.name}\`  -  \`${song.formattedDuration}\` \n\nRequested by😘: ${song.user}\n${status(queue)}`)
     })
     .on("addSong", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "Added a Song!", `Song: \`${song.name}\`  -  \`${song.formattedDuration}\` \n\nRequested by😘: ${song.user}`)
     })
     .on("playList", (message, queue, playlist, song) => {
        embedbuilder(client, message, "GREEN", "Playling playlist", `Playlist: \`${playlist.title}\`  -  \`${playlist.total_items} songs\` \n\nRequested by😘: ${song.user}\n\nstarting playing Song: \`${song.name}\`  -  \`${song.formattedDuration}\`\n${status(queue)}`)
     })
     .on("addList", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "Added a Playling!", `Playlist: \`${playlist.title}\`  -  \`${playlist.total_items} songs\` \n\nRequested by😘: ${song.user}`)
     })
     .on("searchResult", (message, result) => {
        let i = 0;
        embedbuilder(client, message, "YELLOW", "", `**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`)
    })
     // DisTubeOptions.searchSongs = true
     // this even is for error
     .on("searchCancel", (message) =>  embedbuilder(client, message, "RED", `💢Searching canceled💢`, "")
     )
     .on("error", (message, err) => embedbuilder(client, message, "RED", "💢An error encountered:💢", err)
     )
     .on("empty", message => embedbuilder(client, message, "RED", "You just leave and i keep play🤦‍♂️" )
     )
     .on("noRelated", message => embedbuilder(client, message, "RED", "I can't find any Related video to play🤷‍♂️")
     )
     .on("finish", message => embedbuilder(client, message, "RED", "No more song in queue🙅‍♂️ ") 
     )

//function embeds
//embedbuilder(client, message, "RED", "TITEL", "DESCRIPTION")
function embedbuilder(client, message, color, title, description){
    let embed = new Discord.MessageEmbed()
    .setColor(color)
    .setFooter(client.user.username, client.user.displayAvatarURL());
    if(title) embed.setTitle(title);
    if(description) embed.setDescription(description);
    return message.channel.send(embed);
}
