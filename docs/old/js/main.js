jQuery(function () {
	const $sidebar = $('nav');
	const $main = $('main');

	const found = true;

	let $el;

	$sidebar.find('a').click(function () {
		$('body').removeClass('nav-open');
	});

	$('.code-blocks > div.highlighter-rouge:first-of-type').each(function (i) {
		const $this = $(this).before('<ul class="languages"></ul>');
		const $languages = $this.prev();
		const $notFirst = $this.nextUntil(':not(div.highlighter-rouge)');
		const $all = $this.add($notFirst);

		$all.add($languages).wrapAll('<div class="code-viewer"></div>');

		listLanguages($all, $languages);

		$this.css('display', 'block');
		$notFirst.css('display', 'none');

		$languages.find('a').first().addClass('active');

		$languages.find('a').click(function () {
			$all.css('display', 'none');
			$all.eq($(this).parent().index()).css('display', 'block');

			$languages.find('a').removeClass('active');
			$(this).addClass('active');
			return false;
		});

		if ($languages.children().length === 0) {
			$languages.remove();
		}
	});

	function listLanguages($el, $insert) {
		$el.each(function (i) {
			const title = $(this).attr('title');
			if (title) {
				$insert.append('<li><a href="#">' + title + '</a></li>');
			}
		});
	}

	const href = $('.sidebar a').first().attr('href');

	if (href !== undefined && href.charAt(0) === '#') {
		setActiveSidebarLink();

		$(window).on('scroll', function (evt) {
			setActiveSidebarLink();
		});
	}

	function setActiveSidebarLink() {
		$('.sidebar a').removeClass('active');
		const $closest = getClosestHeader();
		$closest.addClass('active');
		document.title = $closest.text();
	}
});

function getClosestHeader() {
	const $links = $('.sidebar a');
	const top = window.scrollY;
	let $last = $links.first();

	if (top < 300) {
		return $last;
	}

	if (top + window.innerHeight >= $('.main').height()) {
		return $links.last();
	}

	for (let i = 0; i < $links.length; i++) {
		const $link = $links.eq(i);
		const href = $link.attr('href');

		if (href !== undefined && href.charAt(0) === '#' && href.length > 1) {
			const $anchor = $(href);

			if ($anchor.length > 0) {
				const offset = $anchor.offset();

				if (top < offset.top - 300) {
					return $last;
				}

				$last = $link;
			}
		}
	}
	return $last;
}
