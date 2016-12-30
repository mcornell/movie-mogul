50 iflf<3then61000
100 clr:print""
120 :
160 dim ac$(140),an%(140,8),mo$(12),mn$(12,6),mn%(12,3,8),ad(8),tw(8),tr(8)
161 dimpy(12)
162 dim hl%(12,2),fg$(4,5),jj$(4,5),kk$(4,5)
164 dim s(12)
180 a=3
190 ml$=",000"
192 sp$="                                       "
193 dn$=""
194 df$=""
195 dg$=""
200 ifad=0thengosub60000:sys51459: rem       read stuff and turn off title pic
340 :
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
440 print""
480 fori=1to3
500 print""str$(i)")  "mn$(s(i),1)
520 printmn$(s(i),2)
530 printmn$(s(i),3)
540 print"*roles==> ";mn$(s(i),4)
550 printspc(10)mn$(s(i),5)
560 printspc(10)mn$(s(i),6)
570 print
580 nexti
590 print"You have been sent three scripts."
600 print"Which do you want to produce(1-3)?";
610 poke198,0:wait198,1:getz$
620 z=val(z$)
630 ifz<1orz>3then610
635 z=s(z)
640 printz$:mv$=mn$(z,1):fori=2to6:mv$(i)=mn$(z,i):nexti
650 fori=1to3:forj=1to8:mv(i,j)=mn%(z,i,j):nextj,i
660 fori=1to12:ifmv$=mo$(i)then680
670 nexti
680 ll=hl%(i,1):hh=hl%(i,2)
690 print""
700 print""spc(14)"Casting Call"
710 print""spc(18)"for"
720 print""spc(19-len(mv$)/2)chr$(34)mv$chr$(34)
730 print""spc(14)"Please wait..."
735 :
865 forpp=1to12:s(pp)=0:next
870 :
880 xm%=int(rnd(1)*5)+4
890 fork=1toxm%
900 x=int(rnd(1)*76)+1
910 forpp=1toxm%
920 ifx=s(pp)thenpp=xm%:goto900
930 nextpp
940 s(k)=x
950 nextk
960 :
970 fork=xm%+1to12
980 x=int(rnd(1)*(140-77))+77
990 forpp=xm%+1to12
1000 ifx=s(pp)thenpp=12:goto980
1010 nextpp
1020 s(k)=x
1030 nextk
1040 :
1050 :
1060 :
1070 :
1220 print""
1230 printspc(6);"NAME";spc(20)"PAY"
1240 print:fori=1to12
1250 printspc(1+abs(i<10))str$(i);") ";ac$(s(i));tab(25):gosub3780
1260 nexti
1270 :
1280 print"":ct=0
1290 print"Who will you cast as the":printmv$(4);:inputaa$
1295 aa=val(aa$)
1300 ifaa<1oraa>12thenprint"":goto1290
1305 sa=aa:aa=s(aa)
1320 ifmv(1,1)=5then1335
1330 ifmv(1,1)<>an%(aa,1)thenprint"":goto1290
1335 print""ac$(aa)left$(sp$,39-len(ac$(aa)))
1340 fm$=mv$(4)+":"+ac$(aa):iflen(fm$)>40thengosub6500
1350 a1$=ac$(aa):ct=ct+py(sa):a1=sa:forj=1to8:ao(j)=an%(aa,j):next
1355 :
1356 :
1360 print"Who will you cast as the":printmv$(5);:inputaa$
1365 aa=val(aa$)
1370 ifaa<1oraa>12oraa=a1thenprint"":goto1360
1375 sa=aa:aa=s(aa)
1380 :
1390 ifmv(2,1)=5then1405
1400 ifmv(2,1)<>an%(aa,1)thenprint"":goto1360
1405 print""ac$(aa)left$(sp$,39-len(ac$(aa)))
1410 fm$=mv$(5)+":"+ac$(aa):iflen(fm$)>40thengosub6500
1420 a2$=ac$(aa):ct=ct+py(sa):a2=sa:forj=1to8:tw(j)=an%(aa,j):next
1425 :
1426 :
1430 print"Who will you cast as the":printmv$(6);:inputaa$
1435 aa=val(aa$)
1440 if(aa<1oraa>12)oraa=a1oraa=a2thenprint"":goto1430
1445 sa=aa:aa=s(aa)
1460 ifmv(3,1)=5then1480
1470 ifmv(3,1)<>an%(aa,1)thenprint"":goto1430
1480 fm$=mv$(6)+":"+ac$(aa):iflen(fm$)>40thengosub6500
1482 print""ac$(aa)left$(sp$,39-len(ac$(aa)))
1490 a3$=ac$(aa):ct=ct+py(sa):forj=1to8:tr(j)=an%(aa,j):next
1492 ifa1$="Schwarzenegger"thena1$="Arnold "+a1$
1493 ifa2$="Schwarzenegger"thena2$="Arnold "+a2$
1494 ifa3$="Schwarzenegger"thena3$="Arnold "+a3$
1495 :
1496 :
1500 print""
1501 cm$=str$(ct):gosub22000
1502 print"Total cost of salaries: $";cm$;ml$
1505 cm$=str$(ll):gosub22000
1510 print"How much do you want to spend on        production(";
1511 printcm$ml$" - 30,000,000)":             print"$";
1516 inputpa$:ifval(pa$)/1000>=llthen1520
1517 iflen(pa$)<7orlen(pa$)>11then1510
1518 gosub20000:goto1530
1520 mm=int(val(pa$)/1000)
1530 ifmm<llormm>30000then1510
1540 ifmm>hhthenmn=hh:goto1560
1550 mn=mm
1560 x=int(rnd(1)*10)+1
1565 :
1570 onxgoto3900,3920,3930,3940,3950,3960,3970,1580,1580,1580
1580 x=int(rnd(1)*100)+1
1590 ifx>=70thenprintdg$"The movie comes in on budget.":goto1650
1600 ifx>=30thenprintdg$"The production went 2% over budget.":mm=mm+int(mm*.02)
1602 ifx>=30then1650
1610 ifx>=15thenprintdg$"The production went 5% over budget.":mm=mm+int(mm*.05)
1612 ifx>=15then1650
1620 ifx>=7thenprintdg$"The production went 10% over budget.":mm=mm+int(mm*.1)
1622 ifx>=15then1650
1630 ifx>=3thenprintdg$"The production went 20% over budget.":mm=mm+int(mm*.2)
1632 ifx>=15then1650
1640 printdg$"The production went 30% over budget.":mm=mm+int(mm*.3)
1650 ct=ct+mm:cm$=str$(ct):gosub22000
1660 printleft$(dn$,20)"total cost = $";cm$;ml$:print
1670 gosub3980
1680 print""
1690 print"":print"       MAJOR STUDIO SNEAK PREVIEW"
1700 print"":printspc(19)"of"
1710 y=20-int(len(mv$)/2)
1720 print""spc(y)""mv$""
1730 print"":printspc(16)"starring"
1731 vx$=a1$:vy$=a2$:vz$=a3$
1732 iflen(vy$)=21thendm$=vx$:vx$=vy$:vy$=dm$
1733 iflen(vz$)=21thendm$=vx$:vx$=vz$:vz$=dm$
1740 y=20-int(len(vx$)/2)
1750 printleft$(dn$,15)spc(y)vx$
1760 y=20-int((len(vy$)+len(vz$)+3)/2)
1765 ify=0theny=1
1770 printleft$(dn$,17)spc(y)vy$;" & ";vz$:print
1780 printleft$(dn$,19)spc(30);:x=int(rnd(1)*3)+1
1790 ifx=1thenprint"rated pg":goto1820
1800 ifx=2thenprint"rated pg13":goto1820
1810 print"rated r"
1820 gosub3980
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
1960 print"":bq=0:aq=0
1970 fori=1to3
1980 aq=int((aq+mv(i,3)+mv(i,4))*1.10)
1990 nexti
2000 fori=3to8
2010 ifao(i)<mv(1,i)thenbq=bq+(ao(i)-mv(1,i))
2020 iftw(i)<mv(2,i)thenbq=bq+(tw(i)-mv(2,i))
2030 iftr(i)<mv(3,i)thenbq=bq+(tr(i)-mv(3,i))
2040 nexti
2050 ifa<0thena=-1
2060 cq=(a*90)+50
2070 dq=int(mn/100)
2080 mq=38*(aq+bq)+cq+dq
2090 x=int(rnd(1)*950+1)
2100 wt=(mq-x)*8
2110 xx=int(rnd(1)*3)+1
2120 wk=1:tt=0
2130 print""spc(17)"WEEK";wk
2140 x=int(rnd(1)*1200)+100
2150 wt=wt-x
2160 ifxx=4thenyy=.25
2170 ifxx=1thenyy=.02
2180 ifxx=2thenyy=.07
2190 ifxx=3thenyy=.15
2200 wt=wt-int(wt*yy)
2210 ifwt<200thenwt=200
2215 cm$=str$(wt):gosub22000
2220 print"Weekly gross - $";cm$;ml$;"           "
2230 tt=tt+wt
2235 cm$=str$(tt):gosub22000
2240 print"Total gross - $";cm$;ml$
2250 gosub3980
2260 ifwt<500then2280
2270 wk=wk+1:goto2130
2280 print"":bl$=chr$(34)+mv$+chr$(34)
2281 bl$=bl$+" starring "+a1$+", "+a2$+" and "+a3$
2282 bl$=bl$+" has been pulled from the theaters after"+str$(wk)+" weeks."
2283 gosub7500:print
2290 print"subtotal = $";cm$;ml$
2300 gosub3980:fm$="+----------------------------------+"
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
2340 print"Welcome to the annual Academy":print"Awards presentation."
2350 print"Here to present the first award is ":rx%=1:px%=xm%:oz$="actor"
2351 xx%=76:gosub3230:w=0
2360 printleft$(dn$,10)"The winner of the Oscar for Best":print"Actress is ";
2361 fordl=1to500:nextdl:gosub3390
2370 print"Here to present the next Oscar is ":rx%=xm%+1:px%=12
2371 xx%=64:gosub3230
2380 printleft$(dn$,10)"The winner of the Oscar for Best":print"Actor is ";
2381 fordl=1to500:nextdl:gosub3530
2390 print"Here to award the final oscar is"
2394 rx%=xm%+1:px%=12:xx%=64
2395 gosub3230
2400 printleft$(dn$,10)"The award for Best Picture goes to":forzx=1to500:next
2401 gosub3670
2410 :
2420 print"":ifw>0thenprint"Because of the Oscars, your movie"
2421 ifw>0thenprint"will be re-released.":goto2440
2430 goto2510
2440 gosub3980:ifw>1thenw=1.3
2445 od=int(rnd(1)*500)
2450 iftt<20000thenoi=int(rnd(1)*20000)+9501:goto2475
2460 iftt>80000thenoi=(int(rnd(1)*6)+15)/100*tt:goto2475
2470 oi=(int(rnd(1)*20)+20)/100*tt
2475 xt=int(w*oi+od)
2480 tt=tt+xt
2490 cm$=str$(xt):gosub22000
2500 print"The re-release grosses $";cm$;ml$:goto2520
2510 printleft$(dn$,15)"Your movie will not be re-released."
2520 gosub3980
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
2610 open8,8,8,"mm.high scores"
2630 fori=1to4
2640 forj=1to5
2660 input#8,fg$(i,j):input#8,jj$(i,j):input#8,kk(i,j)
2670 nextj
2680 nexti
2690 close8
2695 goto10000
2699 remhspage1
2700 print""spc(15)"HIGH SCORES"
2710 print:printspc(13)"HIGHEST PROFIT":print
2720 fori=1to5
2730 printfg$(1,i);spc(21-len(fg$(1,i)));left$(jj$(1,i),3);
2735 iflen(jj$(1,i))=4thenprint""right$(jj$(1,i),1);"";
2740 ifkk(1,i)>99999thenprintspc(1);:goto2770
2750 ifkk(1,i)>9999thenprintspc(2);:goto2770
2760 printspc(3);
2770 cm$=str$(kk(1,i)):gosub22000:print"$";cm$;ml$:nexti
2780 print:printspc(12)"GREATEST REVENUES":print
2790 fori=1to5
2800 printfg$(2,i);spc(21-len(fg$(2,i)));left$(jj$(2,i),3);
2805 iflen(jj$(2,i))=4thenprint""right$(jj$(2,i),1);"";
2810 ifkk(2,i)>99999thenprintspc(1);:goto2840
2820 ifkk(2,i)>9999thenprintspc(2);:goto2840
2830 printspc(3);
2840 cm$=str$(kk(2,i)):gosub22000:print"$";cm$;ml$:nexti
2845 u6=1:return
3220 goto2700
3230 remfindpresenter
3240 x=int(rnd(1)*140)+1
3270 pt$=ac$(x)
3285 ifx=18andxx%=76thenpt$="Arnold "+pt$
3290 ifpt$=a1$then3240
3292 ifpt$=a2$then3240
3294 ifpt$=a3$then3240
3370 printpt$
3380 return
3390 remfindactress
3400 x=int(rnd(1)*30)+6
3410 ifao(1)=9 and ao(3)+mv(1,3)>xthenprinta1$;" for ":printmv$:w=w+.4:goto3510
3420 iftw(1)=9 and ao(3)+mv(2,3)>xthenprinta2$;" for ":printmv$:w=w+.4:goto3510
3430 iftr(1)=9 and ao(3)+mv(3,3)>xthenprinta3$;" for ":printmv$:w=w+.4:goto3510
3440 x=int(rnd(1)*140)+1
3450 aa$=ac$(x)
3460 ifan%(x,1)<>9oraa$=a1$oraa$=a2$oraa$=a3$then3440
3470 printac$(x);" for "
3475 fori=1to8:x%(i)=an%(x,i):nexti
3480 x=int(rnd(1)*12)+1
3490 gosub7000:ifn%=1then3480
3500 printmo$(x)
3510 gosub3980
3520 return
3530 remfindactor
3540 x=int(rnd(1)*30)+6
3550 ifao(1)=1 and ao(3)+mv(1,3)>xthenprinta1$;" for ":printmv$:w=w+.4:goto3650
3560 iftw(1)=1 and ao(3)+mv(2,3)>xthenprinta2$;" for ":printmv$:w=w+.4:goto3650
3570 iftr(1)=1 and ao(3)+mv(3,3)>xthenprinta3$;" for ":printmv$:w=w+.4:goto3650
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
3670 remfindmovie
3680 x=int(rnd(1)*130)+21:fq=0
3690 fori=1to3
3700 fq=fq+mv(i,3):nexti
3710 fq=fq+ao(3)+tw(3)+tr(3)
3720 iffq>xthenprintmv$:w=w+1:goto3760
3730 x=int(rnd(1)*12)+1
3740 ifmo$(x)=mv$orx=2orx=7then3730
3750 printmo$(x)
3760 gosub3980
3770 return
3780 rem findpay
3790 x=int(rnd(1)*300)+31
3800 py(i)=int((an%(s(i),3)/2)+an%(s(i),4))*x
3802 ifpy(i)<100thenpy(i)=py(i)+100
3805 cm$=str$(py(i)):gosub22000
3807 iflen(cm$)<4thencm$="  "+cm$
3810 print"$";cm$;ml$
3820 return
3830 remreviews
3840 x=int(rnd(1)*10)+1:                     fordl=1to500:nextdl
3850 ifx=>9thenps$=ps$+"loved it!":a=a+2:goto3890
3860 ifx=>6thenps$=ps$+"liked it.":a=a+1:goto3890
3870 ifx=>3thenps$=ps$+"didn't like it.":a=a-1:goto3890
3880 ps$=ps$+"hated it!":a=a-3
3890 gosub62000:return
3900 remweirdthings
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
3980 printdn$"Press any key to continue";
3981 poke198,0:wait198,1:geta$
3990 return
6500 k=0
6510 k=k+1
6520 ifmid$(fm$,k,1)=" "then6550
6530 goto6510
6550 fm$=right$(fm$,len(fm$)-k)
6560 return
7000 n%=0
7010 ifx=9andx%(7)<5thenn%=1
7020 ifx=6andx%(1)=9andx%(2)<5thenn%=1
7030 ifmo$(x)=mv$orx=2orx=7thenn%=1
7090 return
7500 iflen(bl$)<39thenprintbl$:return
7510 forkw=39to1step-1
7520 ifmid$(bl$,kw,1)=" "then7550
7530 next
7550 printleft$(bl$,kw)
7560 bl$=right$(bl$,len(bl$)-kw)
7570 goto7500
7999 remhspage2
8000 print""spc(15)"HIGH SCORES"
8010 printspc(9):print"Best percentage returned":print
8020 fori=1to5
8030 printfg$(3,i);spc(21-len(fg$(3,i)));left$(jj$(3,i),3);
8035 iflen(jj$(3,i))=4thenprint""right$(jj$(3,i),1);"";
8040 ifkk(3,i)>99999thenprintspc(1);:goto8070
8050 ifkk(3,i)>9999thenprintspc(2);:goto8070
8060 ifkk(3,i)>999thenprintspc(3);:goto8070
8065 printspc(4);
8070 printkk(3,i);"%":nexti
8080 print:printspc(10)"Biggest bombs":print
8090 fori=1to5
8100 printfg$(4,i);spc(21-len(fg$(4,i)));left$(jj$(4,i),3);
8105 iflen(jj$(4,i))=4thenprint""right$(jj$(4,i),1);"";
8110 ifkk(4,i)>99999thenprintspc(1);:goto8140
8120 ifkk(4,i)>9999thenprintspc(2);:goto8140
8130 printspc(3);
8140 cm$=str$(kk(4,i)):gosub22000:print"$";cm$;ml$:nexti
8145 u6=-1:return
10000 z4=0
10005 ifkk(1,5)<tt-ctthengosub11000
10010 ifkk(2,5)<ttthengosub12000
10020 ifkk(3,5)<int(((tt/ct)*100)+.5)thengosub13000
10030 ifkk(4,5)<ct-ttthengosub14000
10040 ifz4=1thengosub10200
10050 goto10500
10200 open15,8,15,"s0:mm.high scores"
10210 close15
10220 open8,8,8,"0:mm.high scores,s,w"
10240 fori=1to4:forj=1to5
10250 print#8,fg$(i,j):print#8,jj$(i,j):print#8,kk(i,j)
10260 nextj:nexti
10265 close8
10270 return
10300 print:print:print"Your score - $";
10310 cm$=pj$:gosub22000:printtab(22-len(cm$));cm$;ml$;
10320 iftt-ct>=0thenprint" profit"
10330 iftt-ct<0thenprint" loss"
10350 printspc(22-len(cm$));int(((tt/ct)+.005)*100);"% returned"
10360 return
10400 printleft$(dn$,24)"Enter your initials";:inputz$
10410 ifz$=""then10400
10420 iflen(z$)>3thenz$=left$(z$,3)
10430 ec$=" "
10440 foryj=1to4:foryi=1to5
10450 iffg$(yj,yi)<>mv$then10490
10455 ifleft$(jj$(yj,yi),3)<>z$then10490
10460 iflen(jj$(yj,yi))=3andec$=" "then ec$="a":goto10490
10465 iflen(jj$(yj,yi))=3then10490
10470 ifec$>right$(jj$(yj,yi),1)then10490
10480 ec$=chr$(asc(right$(jj$(yj,yi),1))+1)
10490 next:next
10493 ifec$=" "then10499
10496 z$=z$+ec$
10499 return
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
11000 ifz4=0thengosub2700:gosub10300:gosub10400
11010 fori=5to2step-1
11030 fg$(1,i)=fg$(1,i-1)
11031 jj$(1,i)=jj$(1,i-1)
11032 kk(1,i)=kk(1,i-1)
11036 iftt-ct>kk(1,i-1)thennexti
11040 fg$(1,i)=mv$:jj$(1,i)=z$:kk(1,i)=tt-ct
11060 z4=1:return
12000 ifz4=0thengosub2700:gosub10300:gosub10400
12010 fori=5to2step-1
12030 fg$(2,i)=fg$(2,i-1)
12031 jj$(2,i)=jj$(2,i-1)
12032 kk(2,i)=kk(2,i-1)
12036 iftt>kk(2,i-1)thennexti
12040 fg$(2,i)=mv$:jj$(2,i)=z$:kk(2,i)=tt
12060 z4=1:return
13000 ifz4=0thengosub8000:gosub10300:gosub10400
13010 fori=5to2step-1
13030 fg$(3,i)=fg$(3,i-1)
13031 jj$(3,i)=jj$(3,i-1)
13032 kk(3,i)=kk(3,i-1)
13036 ifint(((tt/ct)+.005)*100)>kk(3,i-1)thennexti
13040 fg$(3,i)=mv$:jj$(3,i)=z$:kk(3,i)=int(((tt/ct)+.005)*100)
13060 z4=1:return
14000 ifz4=0thengosub8000:gosub10300:gosub10400
14010 fori=5to2step-1
14030 fg$(4,i)=fg$(4,i-1)
14031 jj$(4,i)=jj$(4,i-1)
14032 kk(4,i)=kk(4,i-1)
14036 ifct-tt>kk(4,i-1)thennexti
14040 fg$(4,i)=mv$:jj$(4,i)=z$:kk(4,i)=ct-tt
14060 z4=1:return
20000 forkn=0tolen(pa$)-1
20100 nextkn
20110 pa$=left$(pa$,len(pa$)-4)
20130 mm=val(pa$)
20140 return
22000 cm$=mid$(cm$,2)
22005 iflen(cm$)>3thencm$=left$(cm$,len(cm$)-3)+","+right$(cm$,3)
22010 return
50000 rem   return to ls
50010 load"hello connect",8
50055 end
60000 fori=1to12
60010 readmo$(i):nexti
60020 data "SPACE WARS","SLASHER NIGHTS","DEMON DUSTERS","THE LAST BATTLE"
60030 data "GUNS & RIFLES","FINAL REUNION","BONKERS!","QUEST FOR HONOR"
60040 data "I'VE GOT MUSIC","CONSENT TO KILL","EXECUTIVE DECISIONS"
60050 data "STRANGE BEDFELLOWS"
60060 :
60070 fori=1to12:forj=1to2
60080 readhl%(i,j):nextj,i
60090 data 5000,30000,500,12000,1500,26000,2500,19000,2000,17000,1000,15000
60100 data 250,7000,3000,27000,1200,16000,750,18000,1000,15000,1000,15000
60110 :
60120 :
60130 open8,8,8,"moviedata"
60140 forj=1to12:mn$(j,1)=mo$(j)
60150 forl=2to6:input#8,mn$(j,l):nextl
60160 forg=1to3
60170 forh=1to8
60180 input#8,mn%(j,g,h):print".";
60190 nexth
60200 nextg
60210 nextj
60220 close8
60230 :
60240 open8,8,8,"actordata"
60250 forj=1to140
60260 input#8,ac$(j)
60270 forl=1to8
60280 input#8,an%(j,l)
60290 nextl
60300 nextj
60310 close8
60320 :
60330 ad=1:return
61000 rem    display title screen
61010 iflf=0thenlf=1:load"unpacker",8,1
61020 iflf=1thenlf=2:load"mm.title",8,1
61030 :
61040 poke249,224:poke250,204
61050 poke251,0:poke252,128
61060 poke253,0:poke254,0
61070 sys51456:sys51459:goto100
61080 :
62000 rem   slow for reviews
62010 forpo=1tolen(ps$):printmid$(ps$,po,1);
62020 fordl=1to15:nextdl:nextpo:print
62030 return
