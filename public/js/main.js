
$('.tagsContainer .js-addTag').on('click', function() {
    var $tagsContainer = $(this).parents('.tagsContainer'),
        $tags = $tagsContainer.find('.tags'),
        tag = $.trim($tagsContainer.find('input:text').val()),
        isExist = $tags.find('code').filter(function(){ return $(this).text() == tag }).length > 0;

    if(tag && !isExist) {
        $tags.append('<code>' + tag + '<input type="hidden" name="tags" value="' + tag + '"></code>');
    }
});
$('.tagsContainer input:text').on('blur', function() {
    $('.tagsContainer .js-addTag').trigger('click');
});
$('.tagsContainer ').on('click', 'code', function() {
    $(this).remove();
});

$('.js-filesContainer').on('change', 'input:file', function() {
    var $filesContainer = $(this).parents('.js-filesContainer'),
        $lastFileContainer = $filesContainer.find('.form-group:last'),
        index = $filesContainer.find('input:file').length;

    if($lastFileContainer.find('input:file').get(0).files.length) {
        $lastFileContainer.after('<div class="form-group"><input type="file" name="file' + index + '"/></div>');
    }
});