rem ============================================================
rem  MOVIE MOGUL — C64 BASIC (formatted for readability)
rem  Original from LoadStar floppy, late 1980s
rem
rem  KEY VARIABLES
rem    a     : review score accumulator (starts at 3, not 0!)
rem    ct    : total cost in $thousands (salaries + production)
rem    tt    : total revenue in $thousands
rem    ll/hh : budget min / ideal for selected movie (thousands)
rem    mm    : player's chosen production budget (thousands)
rem    mn    : effective budget used in scoring (capped at hh)
rem    mq    : master quality score driving box office
rem    wt    : current weekly gross ($thousands)
rem    wk    : week counter for theatrical run
rem    w     : oscar win accumulator (+0.4 per acting, +1.0 best picture)
rem    xm%   : number of male actors in casting pool (4-8)
rem    z     : selected movie index (1-12)
rem
rem  KEY ARRAYS
rem    ac$(140)      : actor names
rem    an%(140,8)    : actor stats — [j,1]=gender  [j,2..8]=stats[0..6]
rem    mo$(12)       : movie titles
rem    mn$(12,6)     : [j,1]=title [j,2-3]=description [j,4-6]=role names
rem    mn%(12,3,8)   : role requirements [movie,role,stat]
rem    hl%(12,2)     : budget limits — [i,1]=min  [i,2]=ideal
rem    s(12)         : dual-use: movie indices (1-3), then actor pool (1-12)
rem    py(12)        : calculated pay for each of the 12 pool actors
rem    ao(8)/tw(8)/tr(8) : full stats for cast actors 1 / 2 / 3
rem    mv(3,8)       : role requirements for selected movie
rem    fg$(4,5)/jj$(4,5)/kk(4,5) : high score tables (4 cats x 5 slots)
rem
rem  ACTOR STAT INDICES  an%[j, 1..8]
rem    [j,1] = gender (1=M, 9=F)
rem    [j,2] = stats[0] — unknown purpose
rem    [j,3] = stats[1] — star power (pay formula, oscars, best picture)
rem    [j,4] = stats[2] — pay additive
rem    [j,5..8] = stats[3..6] — fit stats compared against role requirements
rem
rem  ROLE REQUIREMENT INDICES  mn%[j, role, 1..8]
rem    [r,1] = gender required (1=M only, 5=either, 9=F only)
rem    [r,2] = unused
rem    [r,3] = prestige (used in aq quality score and oscar threshold)
rem    [r,4] = quality  (also used in aq score)
rem    [r,5..8] = fit requirements (compared against actor stats in bq loop)
rem ============================================================


rem --- ENTRY POINT: skip title screen if already seen (lf>=3) ---
50 iflf<3then61000


rem ============================================================
rem  INITIALIZATION
rem ============================================================
100 clr:print""
120 :

rem declare all arrays
160 dim ac$(140),an%(140,8),mo$(12),mn$(12,6),mn%(12,3,8),ad(8),tw(8),tr(8)
161 dim py(12)             :rem pay array for casting pool (note: 'dimpy' in original = 'DIM PY')
162 dim hl%(12,2),fg$(4,5),jj$(4,5),kk$(4,5)
164 dim s(12)              :rem dual-use: movie selection, then actor pool

rem initialize globals
180 a=3                    :rem review score — starts at 3, not 0!
190 ml$=",000"             :rem suffix appended to all money display (values are in $thousands)
192 sp$="                                       "   :rem 39-space padding string
193 dn$=""                 :rem display string (color codes)
194 df$=""
195 dg$=""

rem load data from disk on first run only
200 ifad=0thengosub60000:sys51459: rem read data files and turn off title pic


rem ============================================================
rem  MOVIE SELECTION
rem  draw 3 unique random movies from 12, player picks one
rem ============================================================
340 :

rem pick 3 unique random movie indices into s(1..3)
350 s(1)=0:s(2)=0:s(3)=0
360 x=int(rnd(1)*12)+1
370 s(1)=x
380 x=int(rnd(1)*12)+1
385 ifx=s(1)then380
390 s(2)=x
400 x=int(rnd(1)*12)+1
410 ifx=s(1)orx=s(2)then400
420 s(3)=x
430 :

rem display the 3 choices
440 print""
480 fori=1to3
500   print""str$(i)")  "mn$(s(i),1)      :rem title
520   printmn$(s(i),2)                     :rem description line 1
530   printmn$(s(i),3)                     :rem description line 2
540   print"*roles==> ";mn$(s(i),4)        :rem role 1 name
550   printspc(10)mn$(s(i),5)              :rem role 2 name
560   printspc(10)mn$(s(i),6)              :rem role 3 name
570   print
580 nexti

rem player input: get choice (1-3), resolve to actual movie index z
590 print"You have been sent three scripts."
600 print"Which do you want to produce(1-3)?";
610 poke198,0:wait198,1:getz$
620 z=val(z$)
630 ifz<1orz>3then610
635 z=s(z)                 :rem z is now the actual movie index (1-12)

rem load selected movie's string and numeric data into working arrays
640 printz$:mv$=mn$(z,1):fori=2to6:mv$(i)=mn$(z,i):nexti
650 fori=1to3:forj=1to8:mv(i,j)=mn%(z,i,j):nextj,i

rem look up this movie's budget limits from hl%
660 fori=1to12:ifmv$=mo$(i)then680
670 nexti
680 ll=hl%(i,1):hh=hl%(i,2)    :rem ll=min budget, hh=ideal budget (thousands)


rem ============================================================
rem  CASTING CALL
rem  build pool of 12 actors (4-8 male + remainder female)
rem  player casts one actor per role
rem ============================================================
690 print""
700 print""spc(14)"Casting Call"
710 print""spc(18)"for"
720 print""spc(19-len(mv$)/2)chr$(34)mv$chr$(34)
730 print""spc(14)"Please wait..."
735 :

rem --- build actor pool: clear s, then fill with male then female actors ---
rem male ids: 1-76, female ids: 77-139 (no overlap — original pseudocode was wrong)
865 forpp=1to12:s(pp)=0:next
870 :

rem male pass: xm% actors from ids 1-76
880 xm%=int(rnd(1)*5)+4           :rem 4 to 8 male actors (not 4-10 as original notes said)
890 fork=1toxm%
900   x=int(rnd(1)*76)+1          :rem male actor id: 1 to 76
910   forpp=1toxm%
920     ifx=s(pp)thenpp=xm%:goto900   :rem retry if duplicate
930   nextpp
940   s(k)=x
950 nextk
960 :

rem female pass: fill remaining slots from ids 77-139
970 fork=xm%+1to12
980   x=int(rnd(1)*(140-77))+77   :rem female actor id: 77 to 139
990   forpp=xm%+1to12
1000    ifx=s(pp)thenpp=12:goto980    :rem retry if duplicate
1010  nextpp
1020  s(k)=x
1030 nextk
1040 :

rem display actor list — gosub3780 calculates and prints each pay
1220 print""
1230 printspc(6);"NAME";spc(20)"PAY"
1240 print:fori=1to12
1250   printspc(1+abs(i<10))str$(i);") ";ac$(s(i));tab(25):gosub3780
1260 nexti
1270 :

rem --- cast role 1 ---
1280 print"":ct=0
1290 print"Who will you cast as the":printmv$(4);:inputaa$    :rem mv$(4) = role 1 name
1295 aa=val(aa$)
1300 ifaa<1oraa>12thenprint"":goto1290
1305 sa=aa:aa=s(aa)                  :rem sa=pool slot, aa=actual actor id
1320 ifmv(1,1)=5then1335             :rem gender=5 means either ok, skip check
1330 ifmv(1,1)<>an%(aa,1)thenprint"":goto1290    :rem wrong gender, reject
1335 print""ac$(aa)left$(sp$,39-len(ac$(aa)))
1340 fm$=mv$(4)+":"+ac$(aa):iflen(fm$)>40thengosub6500   :rem word-wrap if too long
1350 a1$=ac$(aa):ct=ct+py(sa):a1=sa:forj=1to8:ao(j)=an%(aa,j):next   :rem store actor 1 full stats in ao()
1355 :
1356 :

rem --- cast role 2 ---
1360 print"Who will you cast as the":printmv$(5);:inputaa$    :rem mv$(5) = role 2 name
1365 aa=val(aa$)
1370 ifaa<1oraa>12oraa=a1thenprint"":goto1360    :rem can't reuse slot from role 1
1375 sa=aa:aa=s(aa)
1380 :
1390 ifmv(2,1)=5then1405
1400 ifmv(2,1)<>an%(aa,1)thenprint"":goto1360
1405 print""ac$(aa)left$(sp$,39-len(ac$(aa)))
1410 fm$=mv$(5)+":"+ac$(aa):iflen(fm$)>40thengosub6500
1420 a2$=ac$(aa):ct=ct+py(sa):a2=sa:forj=1to8:tw(j)=an%(aa,j):next   :rem store actor 2 stats in tw()
1425 :
1426 :

rem --- cast role 3 ---
1430 print"Who will you cast as the":printmv$(6);:inputaa$    :rem mv$(6) = role 3 name
1435 aa=val(aa$)
1440 if(aa<1oraa>12)oraa=a1oraa=a2thenprint"":goto1430
1445 sa=aa:aa=s(aa)
1460 ifmv(3,1)=5then1480
1470 ifmv(3,1)<>an%(aa,1)thenprint"":goto1430
1480 fm$=mv$(6)+":"+ac$(aa):iflen(fm$)>40thengosub6500
1482 print""ac$(aa)left$(sp$,39-len(ac$(aa)))
1490 a3$=ac$(aa):ct=ct+py(sa):forj=1to8:tr(j)=an%(aa,j):next    :rem store actor 3 stats in tr()

rem special case: stored as short name, restore full name post-casting
1492 ifa1$="Schwarzenegger"thena1$="Arnold "+a1$
1493 ifa2$="Schwarzenegger"thena2$="Arnold "+a2$
1494 ifa3$="Schwarzenegger"thena3$="Arnold "+a3$
1495 :
1496 :


rem ============================================================
rem  PRODUCTION BUDGET
rem  player chooses spend between ll*1000 and $30,000,000
rem  mm = player budget in thousands
rem  mn = effective budget for scoring — capped at hh (ideal)
rem  spending above hh gains no additional quality
rem ============================================================
1500 print""
1501 cm$=str$(ct):gosub22000
1502 print"Total cost of salaries: $";cm$;ml$

1505 cm$=str$(ll):gosub22000
1510 print"How much do you want to spend on        production(";
1511 printcm$ml$" - 30,000,000)":             print"$";

1516 inputpa$:ifval(pa$)/1000>=llthen1520     :rem direct dollar entry path
1517 iflen(pa$)<7orlen(pa$)>11then1510        :rem invalid length, re-prompt
1518 gosub20000:goto1530                       :rem comma-formatted input path
1520 mm=int(val(pa$)/1000)
1530 ifmm<llormm>30000then1510                :rem outside allowed range
1540 ifmm>hhthenmn=hh:goto1560               :rem cap effective budget at ideal
1550 mn=mm


rem ============================================================
rem  PRODUCTION EVENTS
rem  x=1-7: one of 7 random events
rem  x=8,9,10: no event (30% chance)
rem ============================================================
1560 x=int(rnd(1)*10)+1
1565 :
rem  1: actor 1 cocaine arrest (a -= 2)
rem  2: actor 2 suing enquirer  (a += 3)
rem  3: stunt death              (a -= 2)
rem  4: actor 3 car accident     (ct += $200K)
rem  5: actor 1 fires director   (ct += $450K)
rem  6: actor 2 dating athlete   (a += 2)
rem  7: actor 1 autobiography    (a += 1)
rem  8,9,10: no event
1570 onxgoto3900,3920,3930,3940,3950,3960,3970,1580,1580,1580


rem ============================================================
rem  BUDGET OVERRUN
rem  probabilities: 31%=none, 40%=+2%, 15%=+5%, 8%=+10%, 4%=+20%, 2%=+30%
rem ============================================================
1580 x=int(rnd(1)*100)+1
1590 ifx>=70thenprintdg$"The movie comes in on budget.":goto1650
1600 ifx>=30thenprintdg$"The production went 2% over budget.":mm=mm+int(mm*.02)
1602 ifx>=30then1650
1610 ifx>=15thenprintdg$"The production went 5% over budget.":mm=mm+int(mm*.05)
1612 ifx>=15then1650    :rem dead code
1620 ifx>=7thenprintdg$"The production went 10% over budget.":mm=mm+int(mm*.1)
1622 ifx>=15then1650    :rem dead code
1630 ifx>=3thenprintdg$"The production went 20% over budget.":mm=mm+int(mm*.2)
1632 ifx>=15then1650    :rem dead code
1640 printdg$"The production went 30% over budget.":mm=mm+int(mm*.3)
1650 ct=ct+mm:cm$=str$(ct):gosub22000
1660 printleft$(dn$,20)"total cost = $";cm$;ml$:print
1670 gosub3980


rem ============================================================
rem  SNEAK PREVIEW SCREEN
rem ============================================================
1680 print""
1690 print"":print"       MAJOR STUDIO SNEAK PREVIEW"
1700 print"":printspc(19)"of"
1710 y=20-int(len(mv$)/2)
1720 print""spc(y)""mv$""
1730 print"":printspc(16)"starring"

rem sort: put the longest name (Schwarzenegger=21 chars) first for display
1731 vx$=a1$:vy$=a2$:vz$=a3$
1732 iflen(vy$)=21thendm$=vx$:vx$=vy$:vy$=dm$
1733 iflen(vz$)=21thendm$=vx$:vx$=vz$:vz$=dm$
1740 y=20-int(len(vx$)/2)
1750 printleft$(dn$,15)spc(y)vx$
1760 y=20-int((len(vy$)+len(vz$)+3)/2)
1765 ify=0theny=1
1770 printleft$(dn$,17)spc(y)vy$;" & ";vz$:print

rem random MPAA rating (pg / pg13 / r)
1780 printleft$(dn$,19)spc(30);:x=int(rnd(1)*3)+1
1790 ifx=1thenprint"rated pg":goto1820
1800 ifx=2thenprint"rated pg13":goto1820
1810 print"rated r"
1820 gosub3980


rem ============================================================
rem  REVIEWS
rem  9 critics each add/subtract from review score a
rem  a starts at 3 (line 180) — baseline is already positive
rem  verdicts: loved it (+2) / liked it (+1) / didn't like it (-1) / hated it (-3)
rem ============================================================
1830 print"The reviews are in..."
1840 :
1850 ps$="The NY Times ":gosub3830
1860 ps$="Entertainment Tonight ":gosub3830
1870 ps$="Gene Siskel ":gosub3830
1880 ps$="Roger Ebert ":gosub3830
1890 ps$="Sneak Previews ":gosub3830
1900 ps$="Rex Reed ":gosub3830
1910 ps$="Time Magazine ":gosub3830
1920 ps$="Newsweek ":gosub3830
1930 ps$="LA Times ":gosub3830
1932 print""
1940 print"  Press any key to release the movie";:poke198,0:wait198,1:getk$
1950 :


rem ============================================================
rem  BOX OFFICE FORMULA
rem
rem  aq = role quality: sum mv[i,3]+mv[i,4] per role, compounded x1.10
rem  bq = actor fit penalty: negative where actor stat < role requirement
rem         loops over stat indices 3-8  (stats[1..6])
rem  cq = review impact: (a * 90) + 50
rem  dq = budget contribution: mn / 100  (modest effect)
rem  mq = master quality:  38*(aq+bq) + cq + dq
rem  wt = initial weekly gross ($K):  (mq - random(1,950)) * 8
rem ============================================================
1960 print"":bq=0:aq=0

rem aq: compound prestige+quality for each of the 3 roles
1970 fori=1to3
1980   aq=int((aq+mv(i,3)+mv(i,4))*1.10)
1990 nexti

rem bq: penalize where actor stats fall below role requirements (indices 3-8)
2000 fori=3to8
2010   ifao(i)<mv(1,i)thenbq=bq+(ao(i)-mv(1,i))    :rem actor 1 vs role 1
2020   iftw(i)<mv(2,i)thenbq=bq+(tw(i)-mv(2,i))    :rem actor 2 vs role 2
2030   iftr(i)<mv(3,i)thenbq=bq+(tr(i)-mv(3,i))    :rem actor 3 vs role 3
2040 nexti

2050 ifa<0thena=-1                    :rem clamp review score floor at -1
2060 cq=(a*90)+50                     :rem review quality score
2070 dq=int(mn/100)                   :rem 1 pt per $100K (capped at ideal budget)
2080 mq=38*(aq+bq)+cq+dq             :rem master quality score
2090 x=int(rnd(1)*950+1)             :rem random factor 1-950
2100 wt=(mq-x)*8                      :rem initial weekly gross in $K

rem xx = theatre decay type drawn once (1=slow 2=medium 3=fast)
2110 xx=int(rnd(1)*3)+1


rem ============================================================
rem  WEEKLY BOX OFFICE LOOP
rem  runs until weekly gross drops below $500K
rem ============================================================
2120 wk=1:tt=0
2130 print""spc(17)"WEEK";wk
2140 x=int(rnd(1)*1200)+100      :rem weekly audience dropoff ($K)
2150 wt=wt-x
2160 ifxx=4thenyy=.25            :rem dead code (xx is always 1, 2, or 3)
2170 ifxx=1thenyy=.02            :rem slow decay: 2% per week
2180 ifxx=2thenyy=.07            :rem medium: 7%
2190 ifxx=3thenyy=.15            :rem fast: 15%
2200 wt=wt-int(wt*yy)            :rem apply decay
2210 ifwt<200thenwt=200          :rem floor at $200K per week
2215 cm$=str$(wt):gosub22000
2220 print"Weekly gross - $";cm$;ml$;"           "
2230 tt=tt+wt
2235 cm$=str$(tt):gosub22000
2240 print"Total gross - $";cm$;ml$
2250 gosub3980
2260 ifwt<500then2280             :rem run ends when weekly gross drops below $500K
2270 wk=wk+1:goto2130

rem announce film pulled
2280 print"":bl$=chr$(34)+mv$+chr$(34)
2281 bl$=bl$+" starring "+a1$+", "+a2$+" and "+a3$
2282 bl$=bl$+" has been pulled from the theaters after"+str$(wk)+" weeks."
2283 gosub7500:print
2290 print"subtotal = $";cm$;ml$
2300 gosub3980


rem ============================================================
rem  ACADEMY AWARDS INVITATION
rem ============================================================
2300 fm$="+----------------------------------+"
2310 print""fm$:forfk=3to24:printleft$(dn$,fk)" !"
2311 printleft$(dn$,fk)spc(38)"!";:print"":nextfk
2312 printdn$fm$""
2313 print" * I n v i t a t i o n *"
2314 print" ======================="
2315 printleft$(dn$,11)"The Academy of Motion Pictures"
2316 print"Arts and Sciences cordially"
2317 print"invites you to attend its annual"
2318 print"Academy Awards ceremony."
2319 print:print:print"Press any key to attend":poke198,0:wait198,1:geta$
2330 :


rem ============================================================
rem  ACADEMY AWARDS
rem  w accumulates: +0.4 per acting oscar, +1.0 for best picture
rem  a win triggers a re-release after ceremony
rem ============================================================
2340 print"Welcome to the annual Academy":print"Awards presentation."

rem best actress
2350 print"Here to present the first award is ":rx%=1:px%=xm%:oz$="actor"
2351 xx%=76:gosub3230:w=0
2360 printleft$(dn$,10)"The winner of the Oscar for Best":print"Actress is ";
2361 fordl=1to500:nextdl:gosub3390

rem best actor
2370 print"Here to present the next Oscar is ":rx%=xm%+1:px%=12
2371 xx%=64:gosub3230
2380 printleft$(dn$,10)"The winner of the Oscar for Best":print"Actor is ";
2381 fordl=1to500:nextdl:gosub3530

rem best picture
2390 print"Here to award the final oscar is"
2394 rx%=xm%+1:px%=12:xx%=64
2395 gosub3230
2400 printleft$(dn$,10)"The award for Best Picture goes to":forzx=1to500:next
2401 gosub3670
2410 :


rem ============================================================
rem  RE-RELEASE (if any oscar won)
rem  oi = gross base scaled to total revenue tt
rem  xt = int(w * oi + random(0,499)) added to tt
rem ============================================================
2420 print"":ifw>0thenprint"Because of the Oscars, your movie"
2421 ifw>0thenprint"will be re-released.":goto2440
2430 goto2510
2440 gosub3980
2440 ifw>1thenw=1.3              :rem normalize multiple wins to 1.3x multiplier
2445 od=int(rnd(1)*500)          :rem random small bonus
2450 iftt<20000thenoi=int(rnd(1)*20000)+9501:goto2475   :rem floor for small earners
2460 iftt>80000thenoi=(int(rnd(1)*6)+15)/100*tt:goto2475 :rem 15-20% for big earners
2470 oi=(int(rnd(1)*20)+20)/100*tt                        :rem 20-39% for mid earners
2475 xt=int(w*oi+od)
2480 tt=tt+xt
2490 cm$=str$(xt):gosub22000
2500 print"The re-release grosses $";cm$;ml$:goto2520
2510 printleft$(dn$,15)"Your movie will not be re-released."
2520 gosub3980


rem ============================================================
rem  FINAL P&L SUMMARY
rem ============================================================
2530 print""
2531 printtab(int((40-len(mv$))/2));mv$:print
2535 cm$=str$(ct):gosub22000
2540 printleft$(dn$,9)"Total cost - $";cm$;ml$
2545 cm$=str$(tt):gosub22000
2550 printleft$(dn$,12)"Total revenue - $";cm$;ml$
2560 printleft$(dn$,17):pj=abs(tt-ct):pj$=str$(pj)
2565 cm$=pj$:gosub22000
2570 iftt>ctthenprint"You made a profit of $";cm$;ml$:goto2600
2580 iftt<ctthenprint"You lost $";cm$;ml$:goto2600
2590 iftt=ctthenprint"You came out even!"
2600 gosub3980


rem ============================================================
rem  HIGH SCORES — read file, check all 4 categories, maybe save
rem  fg$(cat,slot) = movie title
rem  jj$(cat,slot) = player initials (3 chars + optional dedup suffix)
rem  kk(cat,slot)  = numeric score
rem  categories: 1=highest profit  2=greatest revenue
rem              3=best % returned  4=biggest bomb (largest loss)
rem ============================================================
2610 open8,8,8,"mm.high scores"
2630 fori=1to4
2640   forj=1to5
2660     input#8,fg$(i,j):input#8,jj$(i,j):input#8,kk(i,j)
2670   nextj
2680 nexti
2690 close8
2695 goto10000


rem ============================================================
rem  HIGH SCORE DISPLAY — PAGE 1 (highest profit + greatest revenue)
rem ============================================================
2699 rem hspage1
2700 print""spc(15)"HIGH SCORES"
2710 print:printspc(13)"HIGHEST PROFIT":print
2720 fori=1to5
2730   printfg$(1,i);spc(21-len(fg$(1,i)));left$(jj$(1,i),3);
2735   iflen(jj$(1,i))=4thenprint""right$(jj$(1,i),1);"";
2740   ifkk(1,i)>99999thenprintspc(1);:goto2770
2750   ifkk(1,i)>9999thenprintspc(2);:goto2770
2760   printspc(3);
2770   cm$=str$(kk(1,i)):gosub22000:print"$";cm$;ml$
2780 nexti
2780 print:printspc(12)"GREATEST REVENUES":print
2790 fori=1to5
2800   printfg$(2,i);spc(21-len(fg$(2,i)));left$(jj$(2,i),3);
2805   iflen(jj$(2,i))=4thenprint""right$(jj$(2,i),1);"";
2810   ifkk(2,i)>99999thenprintspc(1);:goto2840
2820   ifkk(2,i)>9999thenprintspc(2);:goto2840
2830   printspc(3);
2840   cm$=str$(kk(2,i)):gosub22000:print"$";cm$;ml$
2845 nexti
2845 u6=1:return

3220 goto2700


rem ============================================================
rem  SUBROUTINE: FIND AWARD PRESENTER
rem  picks a random actor from full pool (140) who isn't in your cast
rem ============================================================
3230 rem findpresenter
3240 x=int(rnd(1)*140)+1
3270 pt$=ac$(x)
3285 ifx=18andxx%=76thenpt$="Arnold "+pt$   :rem fix Schwarzenegger id=18 if from male range
3290 ifpt$=a1$then3240
3292 ifpt$=a2$then3240
3294 ifpt$=a3$then3240
3370 printpt$
3380 return


rem ============================================================
rem  SUBROUTINE: BEST ACTRESS OSCAR
rem  threshold x = random(6,35)
rem  win condition: actor is female (gender=9)
rem                 AND ao(3) + mv[role,3] > x
rem  NOTE: ao(3) is used for ALL three cast checks — this means
rem  actors 2 and 3 benefit from actor 1's star power. Likely a bug.
rem  (should use tw(3) for actor 2, tr(3) for actor 3)
rem  if none of your cast qualifies, a random actress wins instead
rem  slasher nights (id=2) and bonkers! (id=7) are excluded from nominations
rem ============================================================
3390 rem findactress
3400 x=int(rnd(1)*30)+6
3410 ifao(1)=9 and ao(3)+mv(1,3)>xthenprinta1$;" for ":printmv$:w=w+.4:goto3510
3420 iftw(1)=9 and ao(3)+mv(2,3)>xthenprinta2$;" for ":printmv$:w=w+.4:goto3510  :rem uses ao(3) not tw(3)
3430 iftr(1)=9 and ao(3)+mv(3,3)>xthenprinta3$;" for ":printmv$:w=w+.4:goto3510  :rem uses ao(3) not tr(3)
3440 x=int(rnd(1)*140)+1
3450 aa$=ac$(x)
3460 ifan%(x,1)<>9oraa$=a1$oraa$=a2$oraa$=a3$then3440
3470 printac$(x);" for "
3475 fori=1to8:x%(i)=an%(x,i):nexti
3480 x=int(rnd(1)*12)+1
3490 gosub7000:ifn%=1then3480    :rem check movie eligibility
3500 printmo$(x)
3510 gosub3980
3520 return


rem ============================================================
rem  SUBROUTINE: BEST ACTOR OSCAR
rem  identical to findactress but checks gender=1 (male)
rem ============================================================
3530 rem findactor
3540 x=int(rnd(1)*30)+6
3550 ifao(1)=1 and ao(3)+mv(1,3)>xthenprinta1$;" for ":printmv$:w=w+.4:goto3650
3560 iftw(1)=1 and ao(3)+mv(2,3)>xthenprinta2$;" for ":printmv$:w=w+.4:goto3650  :rem uses ao(3) not tw(3)
3570 iftr(1)=1 and ao(3)+mv(3,3)>xthenprinta3$;" for ":printmv$:w=w+.4:goto3650  :rem uses ao(3) not tr(3)
3580 x=int(rnd(1)*140)+1
3590 aa$=ac$(x)
3600 ifan%(x,1)<>1oraa$=a1$oraa$=a2$oraa$=a3$then3580
3610 printac$(x);" for "
3615 fori=1to8:x%(i)=an%(x,i):nexti
3620 x=int(rnd(1)*12)+1
3630 gosub7000:ifn%=1then3620
3640 printmo$(x)
3650 gosub3980
3660 return


rem ============================================================
rem  SUBROUTINE: BEST PICTURE OSCAR
rem  fq = sum of mv[i,3] for each role  (role prestige scores)
rem     + ao(3) + tw(3) + tr(3)          (stats[1] of all 3 cast actors)
rem  threshold x = random(21,150)
rem  if fq > x: your movie wins, w += 1.0
rem  slasher nights and bonkers! cannot win
rem ============================================================
3670 rem findmovie
3680 x=int(rnd(1)*130)+21:fq=0
3690 fori=1to3
3700   fq=fq+mv(i,3)
3710 nexti
3710 fq=fq+ao(3)+tw(3)+tr(3)     :rem add star power (stats[1]) of all 3 cast actors
3720 iffq>xthenprintmv$:w=w+1:goto3760
3730 x=int(rnd(1)*12)+1
3740 ifmo$(x)=mv$orx=2orx=7then3730   :rem exclude your movie, slasher nights, bonkers!
3750 printmo$(x)
3760 gosub3980
3770 return


rem ============================================================
rem  SUBROUTINE: CALCULATE AND DISPLAY ACTOR PAY
rem  formula: int( stats[1]/2 + stats[2] ) * random(31,330)
rem           where stats[1]=an%[j,3], stats[2]=an%[j,4]
rem  floor: if result < 100, add 100  (minimum $100K)
rem  value is in $thousands; ml$=",000" appended for display
rem ============================================================
3780 rem findpay
3790 x=int(rnd(1)*300)+31           :rem random multiplier: 31 to 330
3800 py(i)=int((an%(s(i),3)/2)+an%(s(i),4))*x
3802 ifpy(i)<100thenpy(i)=py(i)+100
3805 cm$=str$(py(i)):gosub22000
3807 iflen(cm$)<4thencm$="  "+cm$   :rem pad for alignment
3810 print"$";cm$;ml$
3820 return


rem ============================================================
rem  SUBROUTINE: INDIVIDUAL REVIEW
rem  x=random(1,10): >=9 loved (+2) / >=6 liked (+1) /
rem                  >=3 didn't like (-1) / else hated (-3)
rem  typewriter effect: gosub62000 prints ps$ character by character
rem ============================================================
3830 rem reviews
3840 x=int(rnd(1)*10)+1:                     fordl=1to500:nextdl
3850 ifx=>9thenps$=ps$+"loved it!":a=a+2:goto3890
3860 ifx=>6thenps$=ps$+"liked it.":a=a+1:goto3890
3870 ifx=>3thenps$=ps$+"didn't like it.":a=a-1:goto3890
3880 ps$=ps$+"hated it!":a=a-3
3890 gosub62000:return


rem ============================================================
rem  PRODUCTION EVENT SUBROUTINES (branched from ON X GOTO at 1570)
rem ============================================================
3900 rem weirdthings
3910 printdf$:bl$=a1$+" has been arrested for possesion of cocaine. The bad"
3911 bl$=bl$+" publicity could hurt the movie.":a=a-2:gosub7500:goto1580

3920 printdf$;:bl$=a2$+" is suing the National Enquirer. The publicity could be"
3921 bl$=bl$+" good for the movie.":a=a+3:gosub7500:goto1580

3930 printdf$;:bl$="A stunt man is killed while filming. The publicity"
3931 bl$=bl$+" could be bad.":a=a-2:gosub7500:goto1580

3940 printdf$;:bl$=a3$+" is injured in a car accident.  The delay will cost"
3941 bl$=bl$+" you $200,000.":ct=ct+200:gosub7500:goto1580

3950 printdf$;:bl$=a1$+" hates the director. Getting a new one will cost"
3951 bl$=bl$+" $450,000.":ct=ct+450:gosub7500:goto1580

3960 printdf$;:bl$=a2$+" has started dating a famous athlete.  The publicity"
3961 bl$=bl$+" could be good for the movie.":a=a+2:gosub7500:goto1580

3970 printdf$;:bl$=a1$+" has just written an autobiography. The publicity"
3971 bl$=bl$+" could be good for the movie.":a=a+1:gosub7500:goto1580


rem ============================================================
rem  SUBROUTINE: PRESS ANY KEY TO CONTINUE
rem ============================================================
3980 printdn$"Press any key to continue";
3981 poke198,0:wait198,1:geta$
3990 return


rem ============================================================
rem  SUBROUTINE: TRIM LEADING WORD FROM LONG STRING
rem  finds first space in fm$, discards everything before it
rem  used to shorten "role: actor name" strings over 40 chars
rem ============================================================
6500 k=0
6510 k=k+1
6520 ifmid$(fm$,k,1)=" "then6550
6530 goto6510
6550 fm$=right$(fm$,len(fm$)-k)
6560 return


rem ============================================================
rem  SUBROUTINE: OSCAR NOMINATION ELIGIBILITY CHECK
rem  n%=1 means EXCLUDE this movie from nomination
rem  slasher nights (2) and bonkers! (7) are always excluded
rem  edge cases: movie 9 with low x%(7), movie 6 with low-stat actress
rem ============================================================
7000 n%=0
7010 ifx=9andx%(7)<5thenn%=1
7020 ifx=6andx%(1)=9andx%(2)<5thenn%=1
7030 ifmo$(x)=mv$orx=2orx=7thenn%=1
7090 return


rem ============================================================
rem  SUBROUTINE: PRINT STRING WITH WORD-WRAP AT 39 CHARS
rem ============================================================
7500 iflen(bl$)<39thenprintbl$:return
7510 forkw=39to1step-1
7520   ifmid$(bl$,kw,1)=" "then7550
7530 next
7550 printleft$(bl$,kw)
7560 bl$=right$(bl$,len(bl$)-kw)
7570 goto7500


rem ============================================================
rem  HIGH SCORE DISPLAY — PAGE 2 (best % returned + biggest bombs)
rem ============================================================
7999 rem hspage2
8000 print""spc(15)"HIGH SCORES"
8010 printspc(9):print"Best percentage returned":print
8020 fori=1to5
8030   printfg$(3,i);spc(21-len(fg$(3,i)));left$(jj$(3,i),3);
8035   iflen(jj$(3,i))=4thenprint""right$(jj$(3,i),1);"";
8040   ifkk(3,i)>99999thenprintspc(1);:goto8070
8050   ifkk(3,i)>9999thenprintspc(2);:goto8070
8060   ifkk(3,i)>999thenprintspc(3);:goto8070
8065   printspc(4);
8070   printkk(3,i);"%"
8080 nexti
8080 print:printspc(10)"Biggest bombs":print
8090 fori=1to5
8100   printfg$(4,i);spc(21-len(fg$(4,i)));left$(jj$(4,i),3);
8105   iflen(jj$(4,i))=4thenprint""right$(jj$(4,i),1);"";
8110   ifkk(4,i)>99999thenprintspc(1);:goto8140
8120   ifkk(4,i)>9999thenprintspc(2);:goto8140
8130   printspc(3);
8140   cm$=str$(kk(4,i)):gosub22000:print"$";cm$;ml$
8150 nexti
8145 u6=-1:return


rem ============================================================
rem  HIGH SCORE CHECK — compare against bottom of each leaderboard
rem ============================================================
10000 z4=0
10005 ifkk(1,5)<tt-ctthengosub11000    :rem category 1: highest profit
10010 ifkk(2,5)<ttthengosub12000       :rem category 2: greatest revenue
10020 ifkk(3,5)<int(((tt/ct)*100)+.5)thengosub13000   :rem category 3: best % returned
10030 ifkk(4,5)<ct-ttthengosub14000    :rem category 4: biggest bomb
10040 ifz4=1thengosub10200             :rem save if any category was updated
10050 goto10500


rem ============================================================
rem  SUBROUTINE: SAVE HIGH SCORES TO DISK
rem ============================================================
10200 open15,8,15,"s0:mm.high scores"  :rem scratch (delete) old file
10210 close15
10220 open8,8,8,"0:mm.high scores,s,w" :rem open for sequential write
10240 fori=1to4:forj=1to5
10250   print#8,fg$(i,j):print#8,jj$(i,j):print#8,kk(i,j)
10260 nextj:nexti
10265 close8
10270 return


rem ============================================================
rem  SUBROUTINE: DISPLAY PLAYER SCORE SUMMARY
rem ============================================================
10300 print:print:print"Your score - $";
10310 cm$=pj$:gosub22000:printtab(22-len(cm$));cm$;ml$;
10320 iftt-ct>=0thenprint" profit"
10330 iftt-ct<0thenprint" loss"
10350 printspc(22-len(cm$));int(((tt/ct)+.005)*100);"% returned"
10360 return


rem ============================================================
rem  SUBROUTINE: GET PLAYER INITIALS WITH DEDUP SUFFIX
rem  if same initials+movie already in table, appends a/b/c... suffix
rem ============================================================
10400 printleft$(dn$,24)"Enter your initials";:inputz$
10410 ifz$=""then10400
10420 iflen(z$)>3thenz$=left$(z$,3)
10430 ec$=" "
10440 foryj=1to4:foryi=1to5
10450   iffg$(yj,yi)<>mv$then10490
10455   ifleft$(jj$(yj,yi),3)<>z$then10490
10460   iflen(jj$(yj,yi))=3andec$=" "then ec$="a":goto10490
10465   iflen(jj$(yj,yi))=3then10490
10470   ifec$>right$(jj$(yj,yi),1)then10490
10480   ec$=chr$(asc(right$(jj$(yj,yi),1))+1)  :rem next letter in alphabet
10490 next:next
10493 ifec$=" "then10499
10496 z$=z$+ec$
10499 return


rem ============================================================
rem  END OF GAME — show scores, offer play again / view / quit
rem ============================================================
10500 ifu6=-1thengosub8000:goto10503
10501 gosub2700
10503 gosub10300
10505 printdn$"  P)lay Again  V)iew other page  Q)uit  ";
10506 poke198,0:wait198,1
10510 geta$:ifa$="p"then180
10520 ifa$="q"then50000
10530 ifa$<>"v"then10510
10550 ifu6=1thenu6=-1:goto10500
10560 u6=1:goto10500


rem ============================================================
rem  HIGH SCORE INSERT SUBROUTINES
rem  each shifts existing entries down to insert at correct rank
rem ============================================================
11000 rem category 1: highest profit  (tt - ct)
11000 ifz4=0thengosub2700:gosub10300:gosub10400
11010 fori=5to2step-1
11030   fg$(1,i)=fg$(1,i-1)
11031   jj$(1,i)=jj$(1,i-1)
11032   kk(1,i)=kk(1,i-1)
11036   iftt-ct>kk(1,i-1)thennexti
11040   fg$(1,i)=mv$:jj$(1,i)=z$:kk(1,i)=tt-ct
11060 z4=1:return

12000 rem category 2: greatest revenue  (tt)
12000 ifz4=0thengosub2700:gosub10300:gosub10400
12010 fori=5to2step-1
12030   fg$(2,i)=fg$(2,i-1)
12031   jj$(2,i)=jj$(2,i-1)
12032   kk(2,i)=kk(2,i-1)
12036   iftt>kk(2,i-1)thennexti
12040   fg$(2,i)=mv$:jj$(2,i)=z$:kk(2,i)=tt
12060 z4=1:return

13000 rem category 3: best % returned  ( int((tt/ct * 100) + 0.5) )
13000 ifz4=0thengosub8000:gosub10300:gosub10400
13010 fori=5to2step-1
13030   fg$(3,i)=fg$(3,i-1)
13031   jj$(3,i)=jj$(3,i-1)
13032   kk(3,i)=kk(3,i-1)
13036   ifint(((tt/ct)+.005)*100)>kk(3,i-1)thennexti
13040   fg$(3,i)=mv$:jj$(3,i)=z$:kk(3,i)=int(((tt/ct)+.005)*100)
13060 z4=1:return

14000 rem category 4: biggest bomb  (ct - tt)
14000 ifz4=0thengosub8000:gosub10300:gosub10400
14010 fori=5to2step-1
14030   fg$(4,i)=fg$(4,i-1)
14031   jj$(4,i)=jj$(4,i-1)
14032   kk(4,i)=kk(4,i-1)
14036   ifct-tt>kk(4,i-1)thennexti
14040   fg$(4,i)=mv$:jj$(4,i)=z$:kk(4,i)=ct-tt
14060 z4=1:return


rem ============================================================
rem  SUBROUTINE: PARSE COMMA-FORMATTED BUDGET INPUT
rem  strips last 4 characters, re-parses as number
rem  handles input like "5000,000" -> strips ",000" -> mm=5000
rem ============================================================
20000 forkn=0tolen(pa$)-1
20100 nextkn
20110 pa$=left$(pa$,len(pa$)-4)
20130 mm=val(pa$)
20140 return


rem ============================================================
rem  SUBROUTINE: FORMAT DOLLAR AMOUNT STRING
rem  STR$(n) in C64 BASIC prepends a space for positive numbers
rem  this strips that space, then inserts a comma before last 3 digits
rem  caller appends ml$=",000" for the full display value
rem  example: STR$(1234) -> " 1234" -> "1234" -> "1,234" + ",000" -> "$1,234,000"
rem  NOTE: strips exactly 1 character, not 2 (old pseudocode notes were wrong)
rem ============================================================
22000 cm$=mid$(cm$,2)
22005 iflen(cm$)>3thencm$=left$(cm$,len(cm$)-3)+","+right$(cm$,3)
22010 return


rem ============================================================
rem  QUIT — return to LoadStar BBS menu
rem ============================================================
50000 rem   return to ls
50010 load"hello connect",8
50055 end


rem ============================================================
rem  SUBROUTINE: POPULATE ALL GAME DATA (runs once on first play)
rem  1. read movie titles + budget limits from BASIC DATA statements
rem  2. load movie seq file (descriptions, role names, requirements)
rem  3. load actor seq file (names + 8 stats each)
rem ============================================================
60000 fori=1to12
60010   readmo$(i)
60020 nexti

rem movie titles (in order, matching movie data seq file)
60020 data "SPACE WARS","SLASHER NIGHTS","DEMON DUSTERS","THE LAST BATTLE"
60030 data "GUNS & RIFLES","FINAL REUNION","BONKERS!","QUEST FOR HONOR"
60040 data "I'VE GOT MUSIC","CONSENT TO KILL","EXECUTIVE DECISIONS"
60050 data "STRANGE BEDFELLOWS"
60060 :

rem budget limits: min,ideal pairs for each movie (in thousands)
60070 fori=1to12:forj=1to2
60080   readhl%(i,j)
60090 nextj,i

rem SPACE WARS       SLASHER NIGHTS   DEMON DUSTERS    THE LAST BATTLE
60090 data 5000,30000,500,12000,1500,26000,2500,19000
rem GUNS & RIFLES    FINAL REUNION    BONKERS!         QUEST FOR HONOR
60100 data 2000,17000,1000,15000,250,7000,3000,27000
rem I'VE GOT MUSIC   CONSENT TO KILL  EXEC DECISIONS   STRANGE BEDFELLOWS
60100 data 1200,16000,750,18000,1000,15000,1000,15000
60110 :
60120 :

rem load movie seq file: 2 desc lines + 3 role names + 3x8 role requirements per movie
60130 open8,8,8,"moviedata"
60140 forj=1to12:mn$(j,1)=mo$(j)          :rem title from DATA
60150   forl=2to6:input#8,mn$(j,l):nextl   :rem description (2) and role names (3)
60160   forg=1to3                           :rem 3 roles
60170     forh=1to8                         :rem 8 requirement values per role
60180       input#8,mn%(j,g,h):print".";   :rem progress dots during load
60190     nexth
60200   nextg
60210 nextj
60220 close8
60230 :

rem load actor seq file: name + 8 stat values per actor (140 actors total)
60240 open8,8,8,"actordata"
60250 forj=1to140
60260   input#8,ac$(j)           :rem actor name
60270   forl=1to8
60280     input#8,an%(j,l)       :rem [j,1]=gender  [j,2..8]=stats[0..6]
60290   nextl
60300 nextj
60310 close8
60320 :
60330 ad=1:return   :rem set loaded flag — won't run again this session


rem ============================================================
rem  SUBROUTINE: DISPLAY TITLE SCREEN (chained file loads)
rem  lf tracks progress: 0 -> load unpacker -> 1 -> load title -> 2 -> display
rem  program restarts from line 50 after each LOAD
rem ============================================================
61000 rem    display title screen
61010 iflf=0thenlf=1:load"unpacker",8,1
61020 iflf=1thenlf=2:load"mm.title",8,1
61030 :
rem poke display registers, call ML routines to show the title graphic
61040 poke249,224:poke250,204
61050 poke251,0:poke252,128
61060 poke253,0:poke254,0
61070 sys51456:sys51459:goto100  :rem run ML display, then jump to main game
61080 :


rem ============================================================
rem  SUBROUTINE: TYPEWRITER EFFECT
rem  prints ps$ one character at a time with a short delay
rem ============================================================
62000 rem   slow for reviews
62010 forpo=1tolen(ps$):printmid$(ps$,po,1);
62020   fordl=1to15:nextdl   :rem delay loop per character
62030 nextpo:print
62030 return
