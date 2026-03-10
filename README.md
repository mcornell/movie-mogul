# Movie Mogul

Movie mogul is an ancient C=64 game that came on a LoadStar floppy in the late 80s.

I used to play this game all of the time as a teenager.

Back in 2015, I found the code, and had the idea of creating a web based game out of it.

I never did it.

Now that it's 2026, I thought it might be fun to look at this using some of the tools that are available now to see if I could convert this and bring myself, and maybe others, some joy.

## Project Organization

The C64 directory contains the original D64 program (movie mogul.prg), which includes the Commodore 64 Basic program, as well as two sequential files that include "actor" and "movie" data.

The psuedocode.txt was my original effort to translate what the program was doing. It may or may not be correct.

Util contains some ruby programs I wrote to convert the seq files into a modern data structure. I've left them for reference. I would like to rewrite into a consistent tool across the project
