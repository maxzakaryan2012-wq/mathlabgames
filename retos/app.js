/* Retos diarios: lectura y reclamacion de XP desde funciones seguras de Supabase. */
(() => {
  const root = document.getElementById('retosSeccion');
  if (!root || !window.MiWeb) return;

  const $ = id => document.getElementById('retos' + id);
  const words = {
    es: {
      title:'🎯 Retos diarios', subtitle:'Completa 10 retos al dia, consigue XP extra y vuelve manana por nuevos retos.',
      teaser:'10 retos cada dia · hasta 165 XP extra', loading:'Cargando los retos de hoy…',
      refresh:'↻ Actualizar retos', completed:'Completados', claimed:'Reclamados',
      potential:'XP posibles', of:'de', progress:'Progreso', play:'▶ Jugar',
      claim:'🎁 Reclamar', claimedButton:'✓ Reclamado', pending:'Pendiente', claiming:'Reclamando…',
      common:'Comun', rare:'Raro', legendary:'Legendario',
      loadError:'No se pudieron cargar los retos. Comprueba la conexion y pulsa Actualizar.',
      claimError:'No se pudo reclamar la recompensa. Vuelve a intentarlo.',
      incomplete:'Este reto aun no esta completo. Juega y vuelve a actualizar.',
      success:'¡Recompensa conseguida! +', already:'Esta recompensa ya estaba reclamada.',
      noChallenges:'Todavia no hay retos disponibles.', note:'El progreso se actualiza desde Supabase. Al volver de un juego, pulsa Actualizar si es necesario.',
      visit:'Visita ', oneCorrect:'Acierta una pregunta en ', severalCorrect:'Consigue {n} aciertos en ', minutes:'Juega {n} minutos a '
    },
    en: {
      title:'🎯 Daily challenges', subtitle:'Complete 10 daily challenges, earn bonus XP and come back tomorrow for more.',
      teaser:'10 challenges every day · up to 165 bonus XP', loading:'Loading today’s challenges…',
      refresh:'↻ Refresh challenges', completed:'Completed', claimed:'Claimed',
      potential:'Available XP', of:'of', progress:'Progress', play:'▶ Play',
      claim:'🎁 Claim', claimedButton:'✓ Claimed', pending:'Not yet', claiming:'Claiming…',
      common:'Common', rare:'Rare', legendary:'Legendary',
      loadError:'Could not load challenges. Check your connection and try Refresh.',
      claimError:'Could not claim the reward. Please try again.',
      incomplete:'Finish this challenge in the game and refresh.',
      success:'Reward claimed! +', already:'This reward was already claimed.',
      noChallenges:'No challenges are available yet.', note:'Progress is synced with Supabase. Refresh after returning from a game if needed.',
      visit:'Visit ', oneCorrect:'Get one correct answer in ', severalCorrect:'Get {n} correct answers in ', minutes:'Play {n} minutes of '
    },
    hy: {
      title:'🎯 Ամենօրյա առաջադրանքներ', subtitle:'Կատարիր օրական 10 առաջադրանք և ստացիր լրացուցիչ XP։',
      teaser:'Ամեն օր 10 առաջադրանք · մինչև 165 XP', loading:'Բեռնվում են այսօրվա առաջադրանքները…',
      refresh:'↻ Թարմացնել', completed:'Կատարված', claimed:'Ստացված',
      potential:'Հնարավոր XP', of:'/', progress:'Առաջընթաց', play:'▶ Խաղալ',
      claim:'🎁 Ստանալ', claimedButton:'✓ Ստացված', pending:'Սպասման մեջ', claiming:'Ստացվում է…',
      common:'Սովորական', rare:'Հազվագյուտ', legendary:'Լեգենդար',
      loadError:'Առաջադրանքները չբեռնվեցին։ Ստուգիր կապը և թարմացրու։',
      claimError:'Պարգևը չհաջողվեց ստանալ։ Փորձիր կրկին։',
      incomplete:'Նախ ավարտիր առաջադրանքը խաղում, հետո թարմացրու։',
      success:'Պարգևը ստացված է՝ +', already:'Պարգևն արդեն ստացված է։',
      noChallenges:'Այսօր առաջադրանքներ չկան։', note:'Առաջընթացը պահվում է Supabase-ում։ Խաղից վերադառնալիս անհրաժեշտության դեպքում թարմացրու։',
      visit:'Այցելիր՝ ', oneCorrect:'Ճիշտ պատասխանիր մեկ հարցի՝ ', severalCorrect:'Ճիշտ պատասխանիր {n} հարցի՝ ', minutes:'Խաղա {n} րոպե՝ '
    }
  };
  const games = {
    '2048':['2048','2048','2048'],
    'adivina-el-numero':['Adivina el numero','Guess the Number','Գուշակիր թիվը'],
    'adivino-tu-numero':['Adivino tu numero','I Guess Your Number','Գուշակում եմ քո թիվը'],
    'ajedrez':['Ajedrez','Chess','Շախմատ'],
    'carrera-matematica':['Carrera matematica','Math Race','Մաթեմատիկական մրցավազք'],
    'crea-el-numero':['Crea el numero','Make the Number','Ստեղծիր թիվը'],
    'dardos-matematicos':['Dardos matematicos','Math Darts','Մաթեմատիկական նետեր'],
    'disparador-primos':['Disparador de primos','Prime Shooter','Պարզ թվերի որս'],
    'duelo-calculo':['Duelo de calculo','Math Duel','Հաշվարկների մենամարտ'],
    'durak':['Durak','Durak','Դուրակ'],
    'pulsa-el-boton':['Pulsa el boton','Press the Button','Սեղմիր կոճակը'],
    'saltos-multiplos':['Saltos multiplos','Multiple Jumps','Բազմապատիկների թռիչքներ'],
    'secuencia':['Secuencia','Sequence','Հաջորդականություն'],
    'verdadero-falso':['Verdadero o falso','True or False','Ճիշտ թե սխալ']
  };
  let data = null, busy = false, claimBusy = false;
  const languages = ['es','en','hy'];
  function language() {
    const value = localStorage.getItem('idioma') || 'es';
    return languages.includes(value) ? value : 'es';
  }
  function t() { return words[language()]; }
  function node(tag, className, textValue) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (textValue !== undefined) e.textContent = String(textValue);
    return e;
  }
  function challengeTitle(item) {
    const lang = language(), index = languages.indexOf(lang), copy = t();
    const game = (games[item.game] || [item.game,item.game,item.game])[index];
    const n = Number(item.target) || 0;
    if (item.event === 'page_enter') return copy.visit + game;
    if (item.event === 'correct') return (n === 1 ? copy.oneCorrect : copy.severalCorrect.replace('{n}', n)) + game;
    if (item.event === 'active_minute') return copy.minutes.replace('{n}', n) + game;
    return String(item.title || game);
  }
  function setStatus(message, isError) {
    const box = $('Estado');
    box.textContent = message || '';
    box.classList.toggle('error', !!isError);
  }
  function dateLabel(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return '';
    try { return new Date(date + 'T12:00:00').toLocaleDateString(language(), { day:'numeric',month:'long',year:'numeric' }); }
    catch { return date; }
  }
  function render() {
    const copy = t();
    $('Titulo').textContent = copy.title;
    $('Descripcion').textContent = copy.subtitle;
    $('Actualizar').textContent = copy.refresh;
    $('Nota').textContent = copy.note;
    $('TeaserTitulo').textContent = copy.title;
    $('TeaserResumen').textContent = copy.teaser;
    const list = $('Lista');
    list.replaceChildren();
    const items = Array.isArray(data && data.items) ? data.items : [];
    const done = items.filter(item => item.complete).length;
    const claimed = items.filter(item => item.claimed).length;
    $('Completados').textContent = done + ' / ' + items.length;
    $('Reclamados').textContent = claimed + ' / ' + items.length;
    $('Disponibles').textContent = String(data && data.available_xp != null ? data.available_xp : 165) + ' XP';
    $('CompletadosLabel').textContent = copy.completed;
    $('ReclamadosLabel').textContent = copy.claimed;
    $('DisponiblesLabel').textContent = copy.potential;
    $('Fecha').textContent = data ? dateLabel(data.date) : '';

    if (data && !items.length) {
      list.append(node('p','retos-vacio',copy.noChallenges));
      return;
    }
    for (const item of items) {
      const rarity = ['comun','raro','legendario'].includes(item.rarity) ? item.rarity : 'comun';
      const card = node('article','retos-tarjeta retos-' + rarity);
      const top = node('div','retos-tarjeta-top');
      const group = node('span','retos-rareza',rarity === 'comun' ? copy.common : rarity === 'raro' ? copy.rare : copy.legendary);
      const reward = node('strong','retos-premio','+' + item.xp + ' XP');
      top.append(group,reward);
      const h = node('h2','retos-tarjeta-titulo',challengeTitle(item));
      const p = Math.max(0,Math.min(Number(item.target)||0,Number(item.progress)||0));
      const total = Math.max(1,Number(item.target)||1);
      const prog = node('div','retos-progreso-cabecera');
      prog.append(node('span','',copy.progress), node('strong','',p + ' / ' + total));
      const track = node('div','retos-barra');
      track.setAttribute('role','progressbar');
      track.setAttribute('aria-valuemin','0');
      track.setAttribute('aria-valuemax',String(total));
      track.setAttribute('aria-valuenow',String(p));
      const fill = node('span','retos-barra-lleno');
      fill.style.width = Math.min(100,100*p/total) + '%';
      track.append(fill);
      const actions = node('div','retos-acciones');
      if (Object.prototype.hasOwnProperty.call(games,item.game)) {
        const link = node('a','retos-jugar',copy.play);
        link.href = 'juegos/' + item.game + '/index.html';
        actions.append(link);
      }
      const button = node('button','retos-reclamar',item.claimed ? copy.claimedButton : item.complete ? copy.claim + ' +' + item.xp + ' XP' : '🔒 ' + copy.pending);
      button.type = 'button';
      button.disabled = !item.complete || !!item.claimed || claimBusy;
      if (item.claimed) card.classList.add('retos-cobrado');
      button.addEventListener('click',() => claim(item.id));
      actions.append(button);
      card.append(top,h,prog,track,actions);
      list.append(card);
    }
  }
  async function load() {
    if (busy) return;
    busy = true;
    $('Actualizar').disabled = true;
    setStatus(t().loading,false);
    try {
      const result = await MiWeb.getDailyChallenges();
      if (!result || !Array.isArray(result.items)) throw new Error('invalid daily challenges response');
      data = result;
      render();
      setStatus('',false);
    } catch (error) {
      console.warn('Retos diarios no disponibles',error);
      setStatus(t().loadError,true);
    } finally {
      busy = false;
      $('Actualizar').disabled = false;
    }
  }
  async function claim(id) {
    if (claimBusy || busy || !data) return;
    const challenge = data.items.find(item => item.id === id);
    if (!challenge || !challenge.complete || challenge.claimed) return;
    claimBusy = true;
    setStatus(t().claiming,false);
    render();
    try {
      const result = await MiWeb.claimDailyChallenge(id);
      if (result && result.claimed) {
        await MiWeb.refreshXp(true);
        await load();
        const message = result.new_claim ? t().success + Number(result.awarded || 0) + ' XP' : t().already;
        setStatus(message,false);
      } else {
        await load();
        setStatus(t().incomplete,false);
      }
    } catch (error) {
      console.warn('Error al reclamar reto diario',error);
      setStatus(t().claimError,true);
    } finally {
      claimBusy = false;
      render();
    }
  }
  function show() {
    render();
    load();
  }
  $('Actualizar').addEventListener('click',load);
  window.addEventListener('pageshow',event => {
    if (event.persisted && location.hash === '#retos') load();
  });
  window.MiWebRetos = { show, render, refresh:load };
  render();
  if (location.hash === '#retos') show();
})();
