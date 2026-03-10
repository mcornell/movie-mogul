#!/usr/bin/ruby -w

def write_actor(ln_ar)
	actor = { 
		:name => "#{ln_ar[0]}",
		:gender => convert_to_gender(ln_ar[1]),
		:data => [ln_ar[2], ln_ar[3], ln_ar[4], ln_ar[5], ln_ar[6], ln_ar[7], ln_ar[8]]
	}
	# You should really fix the escaping of the apostrophe in Names
	puts "insert into actor (name, gender, data0, data1, data2, data3, data4, data5, data6) values ('#{ln_ar[0]}','#{convert_to_gender(ln_ar[1])}',#{ln_ar[2]},#{ln_ar[3]},#{ln_ar[4]},#{ln_ar[5]},#{ln_ar[6]},#{ln_ar[7]},#{ln_ar[8]});"
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

File.open("../c64/actor data.seq", "r") do |actor_file|
	actor_lines = []
    while (line = actor_file.gets)
    	actor_lines << line.chomp
    	if actor_lines.size > 8
    		write_actor(actor_lines)
    		actor_lines = []
    	end			
    end
end

