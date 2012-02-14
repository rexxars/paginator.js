Paginator = (function() {

    var p = function() {};

    p.prototype.setTotalItems = function(num) {
        this.totalItems = num;
        return this;
    };

    p.prototype.getTotalItems = function() {
        return this.totalItems || 0;
    };

    p.prototype.setItemsPerPage = function(num) {
        this.itemsPerPage = num;
        return this;
    };

    p.prototype.getItemsPerPage = function() {
        return this.itemsPerPage || 10;
    };

    p.prototype.setData = function(data) {
        this.data = data;
        this.setTotalItems(data.length);
        return this;
    };

    p.prototype.setCurrentPage = function(num) {
        this.currentPage = this.normalize(num);
        return this;
    };

    p.prototype.count = function() {
        return Math.ceil(this.getTotalItems() / this.getItemsPerPage());
    };

    p.prototype.normalize = function(num) {
        num = Math.max(parseInt(num, 10), 1);

        var pages = this.count();
        if (pages > 0 && num > pages) {
            num = pages;
        }

        return num;
    };

    p.prototype.getItemsByPage = function(page) {
        page = this.normalize(page);

        var offset = (page - 1) * this.getItemsPerPage();
        return this.data ? this.data.slice(offset, this.getItemsPerPage()) : false;
    };

    p.prototype.getCurrentItems = function() {
        return this.getItemsByPage(this.currentPage || 1);
    };

    p.prototype.setPageRange = function(num) {
        this.pageRange = num;
        return this;
    };

    p.prototype.getPageRange = function() {
        return this.pageRange || 10;
    };

    p.prototype.getPagesInRange = function() {
        var pageRange = this.getPageRange();

        var pageNumber = this.currentPage || 1;
        var pageCount  = this.count();

        if (pageRange > pageCount) {
            pageRange = pageCount;
        }

        var delta = Math.ceil(pageRange / 2), lowerBound, upperBound;

        if (pageNumber - delta > pageCount - pageRange) {
            lowerBound = pageCount - pageRange + 1;
            upperBound = pageCount;
        } else {
            if (pageNumber - delta < 0) {
                delta = pageNumber;
            }

            offset     = pageNumber - delta;
            lowerBound = offset + 1;
            upperBound = offset + pageRange;
        }

        lowerBound = this.normalize(lowerBound);
        upperBound = this.normalize(upperBound);

        var pages = [];
        for (pageNumber = lowerBound; pageNumber <= upperBound; pageNumber++) {
            pages.push(pageNumber);
        }
        return pages;
    };

    p.prototype.getInfo = function() {
        var pageCount = this.count();
        var current   = this.currentPage || 1;

        var pages = {
            pageCount    : pageCount,
            itemsPerPage : this.getItemsPerPage(),
            totalItems   : this.getTotalItems(),
            current      : current,
            first        : 1,
            last         : pageCount,
        };

        // Previous and next
        if (current - 1 > 0) {
            pages.previous = current - 1;
        }

        if (current + 1 <= pageCount) {
            pages.next = current + 1;
        }

        // Pages in range
        pages.pagesInRange     = this.getPagesInRange();
        pages.firstPageInRange = Math.min.apply(Math, pages.pagesInRange);
        pages.lastPageInRange  = Math.max.apply(Math, pages.pagesInRange);

        return pages;
    };

    p.prototype.getUrl = function(page, url) {
        var offset = (page - 1) * this.getItemsPerPage();
        var limit  = this.getItemsPerPage();
        return (url || '?page={page}').replace(/\{page\}/g, page).replace(/\{offset\}/g, offset).replace(/\{limit\}/g, limit);
    }

    p.prototype.getHtml = function(options) {
        var pages = this.getInfo(), o = options || {};
        if (pages.pageCount <= 1) {
            return '';
        }

        var html = ['<ul class="' + (o.paginatorClass || 'paginator') + '">'];

        if (pages.previous) {
            // "First"-link
            html.push(
                '<li class="', (o.firstClass || 'first'), '">',
                '<a href="', this.getUrl(pages.first, o.url), '">', (o.firstText || '«'), '</a>',
                '</li>'
            );

            // "Previous"-link
            html.push(
                '<li class="', (o.prevClass || 'previous'), '">',
                '<a href="', this.getUrl(pages.previous, o.url), '">', (o.prevText || '&larr;'), '</a>',
                '</li>'
            );
        }

        var page, active, i = 0;
        for (i = 0; i < pages.pagesInRange.length; i++) {
            page = pages.pagesInRange[i];
            active = (pages.current == page) ? ' class="' + (o.activeClass || 'active') + '"' : '';
            html.push('<li', active, '><a href="', this.getUrl(page, o.url), '">', page, '</a></li>');
        }

        if (pages.next) {
            // "Next"-link
            html.push(
                '<li class="', (o.nextClass || 'next'), '">',
                '<a href="', this.getUrl(pages.next, o.url), '">', (o.prevText || '&rarr;'), '</a>',
                '</li>'
            );

            // "Last"-link
            html.push(
                '<li class="', (o.lastClass || 'last'), '">',
                '<a href="', this.getUrl(pages.last, o.url), '">', (o.lastText || '»'), '</a>',
                '</li>'
            );
        }
        html.push('</ul>');

        return html.join('');
    };

    p.prototype.render = function(options) {
        return this.getHtml(options);
    };

    return p;

})();