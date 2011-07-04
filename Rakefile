require "rubygems"
require "sprockets"

task :default => [:compile]

task :compile => [] do
  files = FileList.new
    .include("src/geojs.js")
    .include("src/plugins/*.js")
  
  files.each do |src|
    secretary = Sprockets::Secretary.new(
      :asset_root   => "dist",
      :load_path    => ["/development/projects/github/sidelab/"],
      :source_files => [src]
    )

    # Generate a Sprockets::Concatenation object from the source files
    concatenation = secretary.concatenation

    # Write the concatenation to disk
    concatenation.save_to("lib/%s" % src.sub(/.*?\//, ''))
  end
  
  # sh 'cp -r src/plugins lib';
end

task :minify => [:compile] do
  basepath = 'dist'
  files = FileList.new
    .include("%s/*.js" % basepath)
    .exclude(/min\.js$/)
    .sub(basepath, '')
    .sub('.js', '')
    
  files.each do |src|
    sh "java -jar /development/tools/javascript/closure/compiler.jar \
           --compilation_level SIMPLE_OPTIMIZATIONS \
           --js_output_file dist/%s.min.js \
           --js dist/%s.js" % [src, src]
  end
end

task :docs => [] do
  sh "perl /development/projects/github/sidelab/joDoc/joDoc \
       --output dist/docs \
       --markdown /development/tools/perl/Markdown.pl \
       --smartypants /development/tools/perl/SmartyPants.pl \
       --title \"Tile5 API Documentation\" \
       --template docs/html/template.html \
       docs/ src/"
end