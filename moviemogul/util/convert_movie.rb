#!/usr/bin/ruby -w
require 'json'

# Remember, these are all stored in C=64 Code!
@films = [ 
	{ 
		:name => "SPACE WARS",
  		:budget_min => 5000,
  		:budget_ideal => 30000,
	},
	{ 
		:name => "SLASHER NIGHTS",
  		:budget_min => 500,
  		:budget_ideal => 12000,
	},
	{ 
		:name => "DEMON DUSTERS",
  		:budget_min => 1500,
  		:budget_ideal => 26000,
	},
	{ 
		:name => "THE LAST BATTLE",
  		:budget_min => 2500,
  		:budget_ideal => 19000,
	},
	{ 
		:name => "GUNS & RIFLES",
  		:budget_min => 2000,
  		:budget_ideal => 17000,
	},
	{ 
		:name => "FINAL REUNION",
  		:budget_min => 1000,
  		:budget_ideal => 15000,
	},
	{ 
		:name => "BONKERS!",
  		:budget_min => 250,
  		:budget_ideal => 7000,
	},
	{ 
		:name => "QUEST FOR HONOR",
  		:budget_min => 3000,
  		:budget_ideal => 27000,
	},
	{ 
		:name => "I'VE GOT MUSIC",
  		:budget_min => 1200,
  		:budget_ideal => 16000,
	},
	{ 
		:name => "CONSENT TO KILL",
  		:budget_min => 750,
  		:budget_ideal => 18000,
	},
	{ 
		:name => "EXECUTIVE DECISIONS",
  		:budget_min => 1000,
  		:budget_ideal => 15000,
	},
	{ 
		:name => "STRANGE BEDFELLOWS",
  		:budget_min => 1000,
  		:budget_ideal => 15000,
	},	
]

def write_movie(ln_ar)
	film = { 
		:description => "#{ln_ar[0]} #{ln_ar[1]}",
		:role_1 => {
			:name => "#{ln_ar[2]}",
			:gender => convert_to_gender(ln_ar[5]),
			:data => [ln_ar[6], ln_ar[7], ln_ar[8], ln_ar[9], ln_ar[10], ln_ar[11], ln_ar[12]]
		},
		:role_2 => {
			:name => "#{ln_ar[3]}",
			:gender => convert_to_gender(ln_ar[13]),
			:data => [ln_ar[14], ln_ar[15], ln_ar[16], ln_ar[17], ln_ar[18], ln_ar[19], ln_ar[20]]
		},
		:role_3 => {
			:name => "#{ln_ar[4]}",
			:gender => convert_to_gender(ln_ar[21]),
			:data => [ln_ar[22], ln_ar[23], ln_ar[24], ln_ar[25], ln_ar[26], ln_ar[27], ln_ar[28]]
		}
	}
	meh = @films.shift.merge(film)
	puts meh
	#puts  JSON.generate(@films.shift.merge(film))
end

def convert_to_gender(value) 
	case value
		when "1"
			return "M"
		when "5"
			return "N"
		when "9"
			return "F"
	end
end

File.open("../c64/movie data.seq", "r") do |movie_file|
	movie_lines = []
    while (line = movie_file.gets)
    	movie_lines << line.chomp
    	if movie_lines.size > 28
    		write_movie(movie_lines)
    		movie_lines = []
    	end			
    end
end

